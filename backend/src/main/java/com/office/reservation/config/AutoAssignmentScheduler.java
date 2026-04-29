package com.office.reservation.config;

import com.office.reservation.dto.AutoAssignmentResponse;
import com.office.reservation.service.AutoAssignmentService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Scheduled task that auto-assigns chairs automatically without admin
 * intervention.
 * After the booking window (1st-20th) closes, employees who didn't
 * reserve any chair for the next month get randomly assigned.
 */
@Component
public class AutoAssignmentScheduler {

    private final AutoAssignmentService autoAssignmentService;
    private final JdbcTemplate jdbcTemplate;

    public AutoAssignmentScheduler(AutoAssignmentService autoAssignmentService, JdbcTemplate jdbcTemplate) {
        this.autoAssignmentService = autoAssignmentService;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Check every day at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void runDailyCheck() {
        checkAndRun();
    }

    /**
     * Also check automatically whenever the backend server starts.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void runOnStartup() {
        System.out.println("=== STARTUP CHECK: AUTO-ASSIGNMENT ===");
        try {
            jdbcTemplate.execute("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check");
            jdbcTemplate.execute("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check1");
            jdbcTemplate.execute("ALTER TABLE days_off DROP CONSTRAINT IF EXISTS days_off_status_check");
            System.out.println("=== DB CONSTRAINTS FIXED (Reservations & Days Off) ===");
        } catch (Exception e) {
            System.err.println("Could not drop constraints: " + e.getMessage());
        }
        checkAndRun();
    }

    private void checkAndRun() {
        LocalDate today = LocalDate.now();
        // Since the window is 1st - 20th, we only auto-assign if day > 20
        if (today.getDayOfMonth() > 20) {
            YearMonth nextMonth = YearMonth.from(today).plusMonths(1);

            System.out.println("=== AUTO-ASSIGNMENT SCHEDULER TRIGGERED ===");
            System.out.println("Past the 20th. Target month: " + nextMonth);

            try {
                // AutoAssignmentService is idempotent: it skips employees that already have
                // reservations.
                AutoAssignmentResponse result = autoAssignmentService
                        .autoAssignChairsForMonth(nextMonth.getYear(), nextMonth.getMonthValue());

                if (result.getTotalReservationsCreated() > 0) {
                    System.out.println("=== AUTO-ASSIGNMENT COMPLETE ===");
                    System.out.println("Employees processed: " + result.getTotalEmployeesProcessed());
                    System.out.println("Reservations created: " + result.getTotalReservationsCreated());
                } else {
                    System.out.println("No new auto-assignments needed. Everyone is already processed.");
                }
            } catch (Exception e) {
                System.err.println("AUTO-ASSIGNMENT FAILED: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println(
                    "Current day is " + today.getDayOfMonth() + " (<= 20). Auto-assignment skipped until the 21st.");
        }
    }
}
