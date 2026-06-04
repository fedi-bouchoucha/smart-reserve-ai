package com.office.reservation.service;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;

/**
 * Integration test verifying that concurrent desk reservations are handled correctly.
 *
 * The DistributedLockService is mocked with a real ReentrantLock so that:
 *   - no Redis connection is needed in the test environment
 *   - genuine lock contention is still simulated in-JVM
 */
@SpringBootTest
@ActiveProfiles("test")
public class ConcurrencyBookingTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    /** Replace the real DistributedLockService with a mock backed by a ReentrantLock. */
    @MockBean
    private DistributedLockService distributedLockService;

    /** Fairness=true ensures threads acquire the lock in arrival order (FIFO). */
    private final ReentrantLock inMemoryLock = new ReentrantLock(true);

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        // Wire executeWithLock to use a real ReentrantLock so threads actually contend
        doAnswer(inv -> {
            String lockKey = inv.getArgument(0);
            long waitSeconds = inv.<Long>getArgument(1);
            Supplier<?> task = inv.getArgument(3);
            try {
                boolean acquired = inMemoryLock.tryLock(waitSeconds, java.util.concurrent.TimeUnit.SECONDS);
                if (!acquired) {
                    throw new RuntimeException("Could not acquire lock for key: " + lockKey + ". Resource is busy.");
                }
                return task.get();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for lock: " + lockKey, e);
            } finally {
                if (inMemoryLock.isHeldByCurrentThread()) {
                    inMemoryLock.unlock();
                }
            }
        }).when(distributedLockService).executeWithLock(anyString(), anyLong(), anyLong(), any());
    }

    @Test
    public void testConcurrentDeskBooking() throws Exception {
        // Chair ID 2 = Desk 2 (no fixed-desk restriction for any employee)
        final Long chairId = 2L;
        final LocalDate date = LocalDate.now().plusMonths(1).withDayOfMonth(15);

        // Remove any pre-existing reservations for this chair/date (test isolation)
        reservationRepository.findAll().stream()
            .filter(r -> r.getChair() != null
                      && r.getChair().getId().equals(chairId)
                      && r.getDate().equals(date))
            .forEach(reservationRepository::delete);

        // Create a fresh ADMIN user (bypasses employee-only booking rules)
        User user = User.builder()
                .username("concurrencyUser_" + System.currentTimeMillis())
                .fullName("Concurrency User")
                .password("password")
                .role(Role.ADMIN)
                .targetAttendance(50)
                .build();
        user = userRepository.save(user);

        final Long userId = user.getId();

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
        executor.shutdown();

        // Exactly 1 booking should succeed; the rest fail (lock contention or duplicate check)
        assertEquals(1, successCount.get(), "Only one reservation should be successful");
        assertEquals(threadCount - 1, failureCount.get(), "Remaining requests should fail");
    }
}
