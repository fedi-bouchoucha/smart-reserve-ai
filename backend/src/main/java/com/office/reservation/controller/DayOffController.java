package com.office.reservation.controller;

import com.office.reservation.dto.DayOffRequest;
import com.office.reservation.dto.DayOffResponse;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.DayOffService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/days-off")
public class DayOffController {

    private final DayOffService dayOffService;
    private final UserRepository userRepository;

    public DayOffController(DayOffService dayOffService, UserRepository userRepository) {
        this.dayOffService = dayOffService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> addDaysOff(@AuthenticationPrincipal UserDetails userDetails,
                                        @RequestBody DayOffRequest request) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<DayOffResponse> responses = dayOffService.addDaysOff(user.getId(), request);
            return ResponseEntity.ok(responses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{date}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> removeDayOff(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            dayOffService.removeDayOff(user.getId(), date);
            return ResponseEntity.ok(Map.of("message", "Day off removed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<DayOffResponse>> getMyDaysOff(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dayOffService.getUserDaysOff(user.getId()));
    }

    @GetMapping("/my/month")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<DayOffResponse>> getMyDaysOffForMonth(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year, @RequestParam int month) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dayOffService.getUserDaysOffForMonth(user.getId(), year, month));
    }

    @GetMapping("/my/month-summary")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<DayOffService.MonthSummary> getMonthSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year, @RequestParam int month) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dayOffService.getMonthSummary(user.getId(), year, month));
    }
}
