package com.office.reservation.service;

import com.office.reservation.dto.ActivityLogRequest;
import com.office.reservation.entity.ActivityLog;
import com.office.reservation.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AnomalyDetectionService {

    private final ActivityLogRepository activityLogRepository;

    // In-memory store: userId -> set of known IPs
    private final Map<Long, Set<String>> knownIpsByUser = new ConcurrentHashMap<>();
    // In-memory store: userId -> set of known devices
    private final Map<Long, Set<String>> knownDevicesByUser = new ConcurrentHashMap<>();
    // In-memory store: userId -> request timestamps (sliding window)
    private final Map<Long, List<Long>> requestTimestamps = new ConcurrentHashMap<>();

    public AnomalyDetectionService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * Analyze a single activity entry and return the enriched ActivityLog with risk assessment.
     */
    public ActivityLog analyze(ActivityLogRequest request) {
        ActivityLog log = new ActivityLog();
        log.setUserId(request.getUserId());
        log.setUsername(request.getUsername() != null ? request.getUsername() : "unknown");
        log.setLoginLocation(request.getLoginLocation());
        log.setIpAddress(request.getIpAddress());
        log.setDeviceType(request.getDeviceType());
        log.setRequestsLastMinute(request.getRequestsLastMinute());
        log.setBookingActions(request.getBookingActions());
        log.setCancellationActions(request.getCancellationActions());

        // Parse timestamp
        if (request.getTimestamp() != null && !request.getTimestamp().isEmpty()) {
            try {
                log.setTimestamp(LocalDateTime.parse(request.getTimestamp(), DateTimeFormatter.ISO_DATE_TIME));
            } catch (Exception e) {
                log.setTimestamp(LocalDateTime.now());
            }
        } else {
            log.setTimestamp(LocalDateTime.now());
        }

        // Run detection rules
        int riskScore = 0;
        List<String> reasons = new ArrayList<>();

        // Rule 1: Location Jump Detection
        riskScore += checkLocationJump(log, reasons);

        // Rule 2: Excessive Request Rate (bot detection)
        riskScore += checkExcessiveRequests(log, reasons);

        // Rule 3: Booking/Cancellation Abuse
        riskScore += checkBookingCancellationAbuse(log, reasons);

        // Rule 4: Off-Hours Login
        riskScore += checkOffHoursLogin(log, reasons);

        // Rule 5: Unknown Device or IP
        riskScore += checkUnknownDeviceOrIp(log, reasons);

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        // Determine status and action
        log.setRiskScore(riskScore);
        log.setStatus(riskScore > 20 ? "ANOMALOUS" : "NORMAL");
        log.setReason(reasons.isEmpty() ? "All activity patterns appear normal." : String.join(" | ", reasons));
        log.setRecommendedAction(mapAction(riskScore));

        // Update known profiles
        updateUserProfile(log);

        return log;
    }

    /**
     * Analyze and persist the result.
     */
    public ActivityLog analyzeAndSave(ActivityLogRequest request) {
        ActivityLog log = analyze(request);
        return activityLogRepository.save(log);
    }

    /**
     * Simulate analysis without persisting — used by the simulation panel.
     */
    public Map<String, Object> simulate(ActivityLogRequest request) {
        ActivityLog log = analyze(request);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", log.getStatus());
        result.put("risk_score", log.getRiskScore());
        result.put("reason", log.getReason());
        result.put("recommended_action", log.getRecommendedAction());
        return result;
    }

    // ─── Detection Rules ─────────────────────────────────────────────

    private int checkLocationJump(ActivityLog log, List<String> reasons) {
        if (log.getUserId() == null || log.getLoginLocation() == null) return 0;

        Optional<ActivityLog> lastLog = activityLogRepository.findTopByUserIdOrderByTimestampDesc(log.getUserId());
        if (lastLog.isPresent()) {
            ActivityLog prev = lastLog.get();
            if (prev.getLoginLocation() != null && !prev.getLoginLocation().isEmpty()) {
                String prevCountry = extractCountry(prev.getLoginLocation());
                String currCountry = extractCountry(log.getLoginLocation());

                if (!prevCountry.equalsIgnoreCase(currCountry)) {
                    // Check time difference
                    long hoursBetween = java.time.Duration.between(prev.getTimestamp(), log.getTimestamp()).toHours();
                    if (Math.abs(hoursBetween) < 2) {
                        reasons.add("Impossible travel: location changed from " + prev.getLoginLocation()
                                + " to " + log.getLoginLocation() + " within " + Math.abs(hoursBetween) + "h");
                        return 35;
                    } else if (Math.abs(hoursBetween) < 8) {
                        reasons.add("Suspicious location change: " + prev.getLoginLocation()
                                + " → " + log.getLoginLocation() + " within " + Math.abs(hoursBetween) + "h");
                        return 20;
                    }
                }
            }
        }
        return 0;
    }

    private int checkExcessiveRequests(ActivityLog log, List<String> reasons) {
        if (log.getRequestsLastMinute() > 200) {
            reasons.add("Critical request flood: " + log.getRequestsLastMinute() + " req/min — automated attack detected");
            return 40;
        } else if (log.getRequestsLastMinute() > 100) {
            reasons.add("Extreme request rate: " + log.getRequestsLastMinute() + " req/min — likely automated bot");
            return 30;
        } else if (log.getRequestsLastMinute() > 60) {
            reasons.add("High request rate: " + log.getRequestsLastMinute() + " req/min — possible bot activity");
            return 25;
        } else if (log.getRequestsLastMinute() > 30) {
            reasons.add("Elevated request rate: " + log.getRequestsLastMinute() + " req/min");
            return 10;
        }
        return 0;
    }

    private int checkBookingCancellationAbuse(ActivityLog log, List<String> reasons) {
        int score = 0;
        int cancellations = log.getCancellationActions();
        int bookings = log.getBookingActions();

        if (cancellations > 10) {
            reasons.add("Excessive cancellations: " + cancellations + " in session — resource manipulation detected");
            score += 25;
        } else if (cancellations > 5) {
            reasons.add("High cancellation rate: " + cancellations + " cancellations in session");
            score += 20;
        }

        if (bookings > 10 && cancellations > 5) {
            reasons.add("Booking/cancel churn pattern: " + bookings + " bookings + " + cancellations + " cancellations — gaming behavior");
            score += 10;
        }

        return Math.min(score, 35);
    }

    private int checkOffHoursLogin(ActivityLog log, List<String> reasons) {
        int hour = log.getTimestamp().getHour();
        if (hour < 6 || hour > 22) {
            reasons.add("Off-hours access at " + String.format("%02d:%02d", hour, log.getTimestamp().getMinute())
                    + " — outside normal working hours (06:00–22:00)");
            return 10;
        }
        return 0;
    }

    private int checkUnknownDeviceOrIp(ActivityLog log, List<String> reasons) {
        int score = 0;

        if (log.getUserId() != null) {
            // Check IP
            Set<String> knownIps = knownIpsByUser.getOrDefault(log.getUserId(), Collections.emptySet());
            if (!knownIps.isEmpty() && log.getIpAddress() != null && !knownIps.contains(log.getIpAddress())) {
                reasons.add("Unknown IP address: " + log.getIpAddress() + " — not seen before for this user");
                score += 10;
            }

            // Check device
            Set<String> knownDevices = knownDevicesByUser.getOrDefault(log.getUserId(), Collections.emptySet());
            if (!knownDevices.isEmpty() && log.getDeviceType() != null && !knownDevices.contains(log.getDeviceType())) {
                reasons.add("Unknown device: " + log.getDeviceType() + " — first time seen for this user");
                score += 10;
            }
        }

        return Math.min(score, 15);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private String extractCountry(String location) {
        if (location == null) return "";
        String[] parts = location.split("[/,]");
        return parts[0].trim();
    }

    private String mapAction(int riskScore) {
        if (riskScore <= 20) return "allow";
        if (riskScore <= 50) return "require_verification";
        if (riskScore <= 80) return "alert_admin";
        return "block";
    }

    private void updateUserProfile(ActivityLog log) {
        if (log.getUserId() == null) return;

        if (log.getIpAddress() != null) {
            knownIpsByUser.computeIfAbsent(log.getUserId(), k -> ConcurrentHashMap.newKeySet())
                    .add(log.getIpAddress());
        }
        if (log.getDeviceType() != null) {
            knownDevicesByUser.computeIfAbsent(log.getUserId(), k -> ConcurrentHashMap.newKeySet())
                    .add(log.getDeviceType());
        }
    }

    /**
     * Track request timestamps for rate limiting (called from JwtFilter).
     */
    public int trackRequest(Long userId) {
        long now = System.currentTimeMillis();
        long oneMinuteAgo = now - 60_000;

        List<Long> timestamps = requestTimestamps.computeIfAbsent(userId, k -> Collections.synchronizedList(new ArrayList<>()));

        // Clean old entries
        timestamps.removeIf(t -> t < oneMinuteAgo);
        timestamps.add(now);

        return timestamps.size();
    }

    // ─── Statistics ─────────────────────────────────────────────────

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);

        stats.put("totalEvents", activityLogRepository.count());
        stats.put("totalAnomalies", activityLogRepository.countByStatus("ANOMALOUS"));
        stats.put("totalNormal", activityLogRepository.countByStatus("NORMAL"));
        stats.put("blockedActions", activityLogRepository.countByRecommendedAction("block"));
        stats.put("alertsRaised", activityLogRepository.countByRecommendedAction("alert_admin"));
        stats.put("verificationsRequired", activityLogRepository.countByRecommendedAction("require_verification"));
        stats.put("events24h", activityLogRepository.countByTimestampAfter(last24h));
        stats.put("anomalies24h", activityLogRepository.countByStatusAndTimestampAfter("ANOMALOUS", last24h));

        return stats;
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<ActivityLog> getAnomalousLogs() {
        return activityLogRepository.findByStatusOrderByTimestampDesc("ANOMALOUS");
    }

    public List<ActivityLog> getUserLogs(Long userId) {
        return activityLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
