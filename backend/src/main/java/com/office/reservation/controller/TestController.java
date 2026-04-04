package com.office.reservation.controller;

import com.office.reservation.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

/**
 * Controller specifically for E2E testing. 
 * Allows resetting the database to a clean state.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    private final ReservationRepository reservationRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final NotificationRepository notificationRepository;
    // We don't reset Users/Chairs/Rooms here as they are part of initial seed 
    // but we clear all activity.

    public TestController(ReservationRepository reservationRepository,
                          ChangeRequestRepository changeRequestRepository,
                          NotificationRepository notificationRepository) {
        this.reservationRepository = reservationRepository;
        this.changeRequestRepository = changeRequestRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<String> resetData() {
        notificationRepository.deleteAll();
        changeRequestRepository.deleteAll();
        reservationRepository.deleteAll();
        return ResponseEntity.ok("Database activity cleared successfully for testing.");
    }
}
