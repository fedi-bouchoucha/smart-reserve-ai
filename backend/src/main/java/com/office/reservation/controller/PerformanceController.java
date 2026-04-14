package com.office.reservation.controller;

import com.office.reservation.dto.PerformanceReportDTO;
import com.office.reservation.dto.TeamPerformanceDTO;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.PerformanceEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private final PerformanceEngineService performanceEngine;
    private final UserRepository userRepository;

    public PerformanceController(PerformanceEngineService performanceEngine,
                                  UserRepository userRepository) {
        this.performanceEngine = performanceEngine;
        this.userRepository = userRepository;
    }

    /**
     * Get performance overview of all employees (admin only).
     */
    @GetMapping("/team")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamPerformanceDTO> getTeamPerformance(
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamPerformanceDTO report = performanceEngine.generateAllEmployeesReport(admin.getFullName());
        return ResponseEntity.ok(report);
    }

    /**
     * Get detailed performance report for a specific employee.
     * Managers can only view their own direct reports.
     */
    @GetMapping("/employee/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getEmployeePerformance(
            @PathVariable Long id) {
        User employee = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        PerformanceReportDTO report = performanceEngine.generateEmployeeReport(id);
        return ResponseEntity.ok(report);
    }

    /**
     * Team comparison — same as team but sorted for comparison view.
     */
    @GetMapping("/team/compare")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamPerformanceDTO> getTeamComparison(
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TeamPerformanceDTO report = performanceEngine.generateAllEmployeesReport(admin.getFullName());
        report.getEmployees().sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return ResponseEntity.ok(report);
    }

    /**
     * Manually trigger weekly snapshot computation (admin only).
     */
    @PostMapping("/compute")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> triggerComputation() {
        LocalDate lastMonday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        int computed = performanceEngine.computeWeeklySnapshots(lastMonday);
        return ResponseEntity.ok(Map.of(
                "message", "Weekly performance snapshots computed successfully.",
                "snapshotsCreated", computed,
                "weekStart", lastMonday.toString()
        ));
    }
}
