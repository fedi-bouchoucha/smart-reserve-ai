package com.office.reservation.controller;

import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.service.AutoAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/auto-assign")
public class TestAutoAssignController {

    private final AutoAssignmentService autoAssignmentService;
    private final ReservationRepository reservationRepository;
    private final JdbcTemplate jdbcTemplate;

    public TestAutoAssignController(AutoAssignmentService autoAssignmentService, 
                                    ReservationRepository reservationRepository,
                                    JdbcTemplate jdbcTemplate) {
        this.autoAssignmentService = autoAssignmentService;
        this.reservationRepository = reservationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/run")
    public ResponseEntity<?> testRun() {
        try {
            return ResponseEntity.ok(autoAssignmentService.autoAssignChairsForMonth(2026, 5));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/fix-db")
    public ResponseEntity<?> fixDb() {
        try {
            jdbcTemplate.execute("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check");
            jdbcTemplate.execute("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check1");
            return ResponseEntity.ok("Database constraints dropped successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/clear")
    @Transactional
    public ResponseEntity<?> clearAutoAssigned() {
        long count = reservationRepository.findAll().stream()
            .filter(r -> "AUTO_ASSIGNED".equals(r.getStatus().name()))
            .count();
        reservationRepository.deleteAll(
            reservationRepository.findAll().stream()
                .filter(r -> "AUTO_ASSIGNED".equals(r.getStatus().name()))
                .toList()
        );
        return ResponseEntity.ok("Deleted " + count + " auto-assigned reservations");
    }
}
