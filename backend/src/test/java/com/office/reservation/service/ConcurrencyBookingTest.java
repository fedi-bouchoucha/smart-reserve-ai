package com.office.reservation.service;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
public class ConcurrencyBookingTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testConcurrentDeskBooking() throws Exception {
        // Create a test user
        User user = User.builder()
                .username("concurrencyUser")
                .fullName("Concurrency User")
                .password("password")
                .role(com.office.reservation.entity.Role.ADMIN) // Admin to bypass monthly limits
                .targetAttendance(50)
                .build();
        user = userRepository.save(user);

        final Long userId = user.getId();
        final LocalDate date = LocalDate.now().plusMonths(1).withDayOfMonth(5); // Next month, 5th
        final Long chairId = 1L; // Assuming chair 1 exists from data initializer

        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(CompletableFuture.runAsync(() -> {
                try {
                    ReservationRequest request = new ReservationRequest(chairId, null, date, null, null);
                    reservationService.createReservation(userId, request);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    System.out.println("Booking failed as expected: " + e.getMessage());
                    failureCount.incrementAndGet();
                }
            }, executor));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        // Only 1 should succeed, 9 should fail due to lock or duplicate check
        assertEquals(1, successCount.get(), "Only one reservation should be successful");
        assertEquals(threadCount - 1, failureCount.get(), "Remaining requests should fail");
    }
}
