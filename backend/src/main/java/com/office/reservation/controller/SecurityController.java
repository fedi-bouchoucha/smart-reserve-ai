package com.office.reservation.controller;

import com.office.reservation.dto.ActivityLogRequest;
import com.office.reservation.entity.ActivityLog;
import com.office.reservation.service.AnomalyDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/security")
@PreAuthorize("hasRole('ADMIN')")
public class SecurityController {

    private final AnomalyDetectionService anomalyDetectionService;

    public SecurityController(AnomalyDetectionService anomalyDetectionService) {
        this.anomalyDetectionService = anomalyDetectionService;
    }

    /**
     * Analyze and persist a single activity log entry.
     */
    @PostMapping("/analyze")
    public ResponseEntity<ActivityLog> analyze(@RequestBody ActivityLogRequest request) {
        ActivityLog result = anomalyDetectionService.analyzeAndSave(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Simulate analysis without persisting — returns JSON result only.
     */
    @PostMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulate(@RequestBody ActivityLogRequest request) {
        Map<String, Object> result = anomalyDetectionService.simulate(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Get the latest 50 activity logs.
     */
    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLog>> getLogs() {
        return ResponseEntity.ok(anomalyDetectionService.getRecentLogs());
    }

    /**
     * Get only anomalous activity logs.
     */
    @GetMapping("/logs/anomalous")
    public ResponseEntity<List<ActivityLog>> getAnomalousLogs() {
        return ResponseEntity.ok(anomalyDetectionService.getAnomalousLogs());
    }

    /**
     * Get activity logs for a specific user.
     */
    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<ActivityLog>> getUserLogs(@PathVariable Long userId) {
        return ResponseEntity.ok(anomalyDetectionService.getUserLogs(userId));
    }

    /**
     * Get dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(anomalyDetectionService.getStats());
    }
}
