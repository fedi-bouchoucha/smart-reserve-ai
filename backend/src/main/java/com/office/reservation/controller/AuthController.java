package com.office.reservation.controller;

import com.office.reservation.dto.LoginRequest;
import com.office.reservation.dto.LoginResponse;
import com.office.reservation.dto.UserCreateRequest;
import com.office.reservation.dto.UserResponse;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.security.JwtUtil;
import com.office.reservation.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.office.reservation.dto.ActivityLogRequest;
import com.office.reservation.service.AnomalyDetectionService;
import com.office.reservation.service.GeoLocationService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final GeoLocationService geoLocationService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          UserService userService,
                          AnomalyDetectionService anomalyDetectionService,
                          GeoLocationService geoLocationService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userService = userService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.geoLocationService = geoLocationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Track the login event asynchronously
        trackLoginEvent(user, httpRequest);

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole().name())
                .userId(user.getId())
                .targetAttendance(user.getTargetAttendance())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.findByUsername(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                    @RequestBody Map<String, String> profileUpdate) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.updateProfile(user.getId(), profileUpdate.get("fullName"), profileUpdate.get("email"), profileUpdate.get("profilePicture"), profileUpdate.get("username")));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.findByUsername(userDetails.getUsername()));
    }

    private void trackLoginEvent(User user, HttpServletRequest request) {
        try {
            ActivityLogRequest logRequest = new ActivityLogRequest();
            logRequest.setUserId(user.getId());
            logRequest.setUsername(user.getUsername());
            String ip = request.getRemoteAddr();
            logRequest.setIpAddress(ip);
            logRequest.setLoginLocation(geoLocationService.getLocation(ip));
            logRequest.setDeviceType(request.getHeader("User-Agent"));
            
            logRequest.setRequestsLastMinute(anomalyDetectionService.trackRequest(user.getId()));
            logRequest.setBookingActions(0);
            logRequest.setCancellationActions(0);

            Thread asyncThread = new Thread(() -> {
                try {
                    anomalyDetectionService.analyzeAndSave(logRequest);
                } catch (Exception ignored) {}
            });
            asyncThread.setDaemon(true);
            asyncThread.start();
        } catch (Exception ignored) {}
    }

    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> requestResetCode(@RequestBody Map<String, String> request) {
        userService.generateResetCode(request.get("email"));
        return ResponseEntity.ok(Map.of("message", "Reset code sent to your email"));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        boolean valid = userService.verifyResetCode(request.get("email"), request.get("code"));
        if (valid) {
            return ResponseEntity.ok(Map.of("message", "Code verified"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired code"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> resetRequest) {
        userService.resetPassword(resetRequest.get("email"), resetRequest.get("newPassword"), resetRequest.get("code"));
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestBody Map<String, String> request) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        userService.changePassword(user.getId(), request.get("oldPassword"), request.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
