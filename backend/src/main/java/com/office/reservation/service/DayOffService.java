package com.office.reservation.service;

import com.office.reservation.dto.DayOffRequest;
import com.office.reservation.dto.DayOffResponse;
import com.office.reservation.entity.DayOff;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.User;
import com.office.reservation.repository.DayOffRepository;
import com.office.reservation.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class DayOffService {

    private final DayOffRepository dayOffRepository;
    private final UserRepository userRepository;

    public DayOffService(DayOffRepository dayOffRepository, UserRepository userRepository) {
        this.dayOffRepository = dayOffRepository;
        this.userRepository = userRepository;
    }

    /**
     * Calculate the number of working days (Mon-Fri) in a given month.
     */
    private int getWorkingDaysInMonth(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        int count = 0;
        for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        return count;
    }

    /**
     * Add days off for a user. Validates the 50% monthly presence rule:
     * The employee must be present (not on day-off) for at least 50% of working days in the month.
     * This means days off cannot exceed 50% of working days.
     */
    @Transactional
    public List<DayOffResponse> addDaysOff(Long userId, DayOffRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DayOffResponse> responses = new ArrayList<>();

        for (LocalDate date : request.getDates()) {
            // Don't allow weekends
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                throw new RuntimeException("Cannot mark weekends as days off — they are already non-working days.");
            }

            // Check if already exists
            if (dayOffRepository.existsByUserIdAndDateAndStatus(userId, date, ReservationStatus.CONFIRMED)) {
                continue; // Skip duplicates silently
            }

            // Validate the 50% rule for this month
            int year = date.getYear();
            int month = date.getMonthValue();
            int workingDays = getWorkingDaysInMonth(year, month);
            int maxDaysOff = workingDays / 2; // 50% means at most half the month can be off

            YearMonth ym = YearMonth.of(year, month);
            long currentDaysOff = dayOffRepository.countByUserIdAndDateBetweenAndStatus(
                    userId, ym.atDay(1), ym.atEndOfMonth(), ReservationStatus.CONFIRMED);

            // Count how many of the remaining request dates fall in this same month
            long newDaysInSameMonth = request.getDates().stream()
                    .filter(d -> d.getYear() == year && d.getMonthValue() == month)
                    .filter(d -> !dayOffRepository.existsByUserIdAndDateAndStatus(userId, d, ReservationStatus.CONFIRMED))
                    .count();

            if (currentDaysOff + newDaysInSameMonth > maxDaysOff) {
                throw new RuntimeException(
                        String.format("Monthly Rule Violation: You can take at most %d days off in %s %d (%d working days). " +
                                "You already have %d days off. You must be present at least 50%% of working days.",
                                maxDaysOff, ym.getMonth().toString(), year, workingDays, currentDaysOff));
            }

            DayOff dayOff = new DayOff(user, date);
            dayOff = dayOffRepository.save(dayOff);
            responses.add(mapToResponse(dayOff));
        }

        return responses;
    }

    /**
     * Remove a day off for a user.
     */
    @Transactional
    public void removeDayOff(Long userId, LocalDate date) {
        DayOff dayOff = dayOffRepository.findByUserIdAndDate(userId, date)
                .orElseThrow(() -> new RuntimeException("Day off not found for this date."));
        if (!dayOff.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        dayOffRepository.delete(dayOff);
    }

    /**
     * Get all days off for a user.
     */
    public List<DayOffResponse> getUserDaysOff(Long userId) {
        return dayOffRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get days off for a specific month.
     */
    public List<DayOffResponse> getUserDaysOffForMonth(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        return dayOffRepository.findByUserIdAndDateBetweenAndStatus(
                userId, ym.atDay(1), ym.atEndOfMonth(), ReservationStatus.CONFIRMED)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get working days count and current days off count for a month (for the frontend progress bar).
     */
    public MonthSummary getMonthSummary(Long userId, int year, int month) {
        int workingDays = getWorkingDaysInMonth(year, month);
        YearMonth ym = YearMonth.of(year, month);
        long daysOff = dayOffRepository.countByUserIdAndDateBetweenAndStatus(
                userId, ym.atDay(1), ym.atEndOfMonth(), ReservationStatus.CONFIRMED);
        int maxDaysOff = workingDays / 2;
        double presencePercentage = workingDays > 0 ? (double)(workingDays - daysOff) / workingDays * 100 : 100;
        return new MonthSummary(workingDays, (int) daysOff, maxDaysOff, presencePercentage);
    }

    private DayOffResponse mapToResponse(DayOff d) {
        return new DayOffResponse(
                d.getId(),
                d.getUser().getId(),
                d.getUser().getFullName(),
                d.getDate(),
                d.getStatus() != null ? d.getStatus().name() : "CONFIRMED",
                d.getCreatedAt()
        );
    }

    // Inner class for month summary
    public static class MonthSummary {
        public int workingDays;
        public int daysOff;
        public int maxDaysOff;
        public double presencePercentage;

        public MonthSummary(int workingDays, int daysOff, int maxDaysOff, double presencePercentage) {
            this.workingDays = workingDays;
            this.daysOff = daysOff;
            this.maxDaysOff = maxDaysOff;
            this.presencePercentage = presencePercentage;
        }
    }
}
