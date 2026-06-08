package com.office.reservation.workflow;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import com.office.reservation.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class ConcurrencyTest {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChairRepository chairRepository;

    @Autowired
    private EmplacementRepository emplacementRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    private Long chairId;
    private List<Long> userIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        userRepository.deleteAll();
        chairRepository.deleteAll();
        emplacementRepository.deleteAll();

        Emplacement emp = new Emplacement();
        emp.setName("100");
        emp = emplacementRepository.save(emp);

        Chair chair = new Chair();
        chair.setNumber(100);
        chair.setEmplacement(emp);
        chair = chairRepository.save(chair);
        chairId = chair.getId();

        for (int i = 0; i < 5; i++) {
            User user = new User();
            user.setUsername("user" + i);
            user.setPassword("pass");
            user.setRole(Role.MANAGER); // Managers can book any month
            user.setFullName("User " + i);
            user.setTargetAttendance(50);
            user = userRepository.save(user);
            userIds.add(user.getId());
        }
    }

    @Test
    void testConcurrentBookings() throws InterruptedException {
        int numThreads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        LocalDate date = LocalDate.now().plusMonths(2); // Far future to avoid window rules
        while (date.getDayOfWeek() == java.time.DayOfWeek.SATURDAY || date.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }

        for (int i = 0; i < numThreads; i++) {
            final Long uId = userIds.get(i);
            executor.execute(() -> {
                try {
                    latch.await();
                    ReservationRequest req = new ReservationRequest();
                    req.setChairId(chairId);
                    req.setDate(date);
                    reservationService.createReservation(uId, req);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                    System.out.println("Booking failed as expected: " + e.getMessage());
                }
            });
        }

        latch.countDown();
        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        assertEquals(1, successCount.get(), "Only one user should successfully book the chair");
        assertEquals(numThreads - 1, failureCount.get(), "All other users should fail");
    }
}
