package com.office.reservation.security;

import com.office.reservation.dto.ActivityLogRequest;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.AnomalyDetectionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final UserRepository userRepository;

    // Track booking/cancellation counts per user session
    private final ConcurrentHashMap<Long, AtomicInteger> bookingCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, AtomicInteger> cancellationCounts = new ConcurrentHashMap<>();

    public JwtFilter(JwtUtil jwtUtil,
                     CustomUserDetailsService userDetailsService,
                     AnomalyDetectionService anomalyDetectionService,
                     UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
                        userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);

                // Lightweight activity tracking for security-relevant endpoints
                trackActivityAsync(request, username);
            }
        }
        filterChain.doFilter(request, response);
    }

    private void trackActivityAsync(HttpServletRequest request, String username) {
        try {
            String uri = request.getRequestURI();
            String method = request.getMethod();

            // Only log meaningful actions (login, reservations, cancellations)
            boolean isBooking = "POST".equals(method) && uri.contains("/reservation");
            boolean isCancellation = "DELETE".equals(method) && uri.contains("/reservation");
            boolean isLogin = uri.contains("/auth/login");

            // Track request rate for this user
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) return;

            User user = userOpt.get();
            int requestsPerMinute = anomalyDetectionService.trackRequest(user.getId());

            // Update booking/cancellation counters
            if (isBooking) {
                bookingCounts.computeIfAbsent(user.getId(), k -> new AtomicInteger(0)).incrementAndGet();
            }
            if (isCancellation) {
                cancellationCounts.computeIfAbsent(user.getId(), k -> new AtomicInteger(0)).incrementAndGet();
            }

            // Log activity on significant actions or high request rates
            if (isBooking || isCancellation || isLogin || requestsPerMinute > 30) {
                ActivityLogRequest logRequest = new ActivityLogRequest();
                logRequest.setUserId(user.getId());
                logRequest.setUsername(username);
                logRequest.setTimestamp(LocalDateTime.now().toString());
                logRequest.setIpAddress(extractClientIp(request));
                logRequest.setDeviceType(parseDeviceType(request.getHeader("User-Agent")));
                logRequest.setRequestsLastMinute(requestsPerMinute);
                logRequest.setBookingActions(bookingCounts.getOrDefault(user.getId(), new AtomicInteger(0)).get());
                logRequest.setCancellationActions(cancellationCounts.getOrDefault(user.getId(), new AtomicInteger(0)).get());

                // Analyze asynchronously (non-blocking)
                Thread asyncThread = new Thread(() -> {
                    try {
                        anomalyDetectionService.analyzeAndSave(logRequest);
                    } catch (Exception ignored) {
                        // Fail silently — security logging should never break the main flow
                    }
                });
                asyncThread.setDaemon(true);
                asyncThread.start();
            }
        } catch (Exception ignored) {
            // Security tracking failures must never disrupt the request pipeline
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String parseDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) return "Mobile";
        if (ua.contains("tablet") || ua.contains("ipad")) return "Tablet";
        if (ua.contains("windows")) return "Windows Desktop";
        if (ua.contains("macintosh") || ua.contains("mac os")) return "Mac Desktop";
        if (ua.contains("linux")) return "Linux Desktop";
        if (ua.contains("postman")) return "API Client (Postman)";
        if (ua.contains("curl")) return "API Client (cURL)";
        return "Desktop";
    }
}
