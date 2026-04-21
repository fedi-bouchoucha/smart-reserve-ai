package com.office.reservation.service;

import com.office.reservation.dto.AutoAssignmentResponse;
import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AutoAssignmentService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final ChairRepository chairRepository;
    private final DayOffRepository dayOffRepository;

    public AutoAssignmentService(UserRepository userRepository,
                                  ReservationRepository reservationRepository,
                                  ChairRepository chairRepository,
                                  DayOffRepository dayOffRepository) {
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.dayOffRepository = dayOffRepository;
    }

    /**
     * Auto-assign random chairs for all employees who did NOT reserve any desk
     * during the 1st-20th booking window, for the specified target month.
     *
     * For each such employee, a random available chair is assigned for every
     * working day (Mon-Fri) of the target month, skipping days off.
     */
    @Transactional
    public AutoAssignmentResponse autoAssignChairsForMonth(int year, int month) {
        YearMonth targetMonth = YearMonth.of(year, month);
        LocalDate monthStart = targetMonth.atDay(1);
        LocalDate monthEnd = targetMonth.atEndOfMonth();

        // 1. Compute all working days (weekdays) in the target month
        List<LocalDate> workingDays = new ArrayList<>();
        for (LocalDate d = monthStart; !d.isAfter(monthEnd); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workingDays.add(d);
            }
        }

        // 2. Get all employees and managers
        List<User> allStaff = new ArrayList<>();
        allStaff.addAll(userRepository.findByRole(Role.EMPLOYEE));
        allStaff.addAll(userRepository.findByRole(Role.MANAGER));

        // 3. Find user IDs who already have at least one desk reservation in the target month
        List<Long> usersWithReservations = reservationRepository
                .findUserIdsWithDeskReservationsInRange(monthStart, monthEnd);
        Set<Long> reservedUserIds = new HashSet<>(usersWithReservations);

        // 4. Split into: employees to auto-assign vs. skipped
        List<User> employeesToAssign = new ArrayList<>();
        List<String> skippedEmployees = new ArrayList<>();

        for (User staff : allStaff) {
            if (reservedUserIds.contains(staff.getId())) {
                skippedEmployees.add(staff.getFullName() + " (already has reservations)");
            } else {
                employeesToAssign.add(staff);
            }
        }

        // 5. For each employee to assign, create reservations for all working days
        List<String> warnings = new ArrayList<>();
        int totalReservationsCreated = 0;
        Random random = new Random();
        LocalTime defaultStart = LocalTime.of(9, 0);
        LocalTime defaultEnd = LocalTime.of(17, 0);

        for (User employee : employeesToAssign) {
            for (LocalDate workDay : workingDays) {
                // Skip if employee has a confirmed day off
                if (dayOffRepository.existsByUserIdAndDateAndStatus(
                        employee.getId(), workDay, ReservationStatus.CONFIRMED)) {
                    continue;
                }

                // Skip if employee already has a desk reservation for this specific date
                // (edge case: could have been assigned in a previous run)
                if (reservationRepository.existsDeskReservationForUserAndDate(
                        employee.getId(), workDay)) {
                    continue;
                }

                // Get available chairs for this day
                List<Chair> availableChairs = chairRepository.findAvailableChairs(
                        workDay, defaultStart, defaultEnd, Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_APPROVAL, ReservationStatus.AUTO_ASSIGNED));

                if (availableChairs.isEmpty()) {
                    warnings.add("No available chairs on " + workDay + " for " + employee.getFullName());
                    continue;
                }

                // Randomly pick one chair
                Chair selectedChair = availableChairs.get(random.nextInt(availableChairs.size()));

                // Create the auto-assigned reservation
                Reservation reservation = Reservation.builder()
                        .user(employee)
                        .chair(selectedChair)
                        .meetingRoom(null)
                        .date(workDay)
                        .startTime(defaultStart)
                        .endTime(defaultEnd)
                        .status(ReservationStatus.AUTO_ASSIGNED)
                        .build();

                reservationRepository.save(reservation);
                totalReservationsCreated++;
            }
        }

        return new AutoAssignmentResponse(
                year,
                month,
                employeesToAssign.size(),
                totalReservationsCreated,
                skippedEmployees,
                warnings
        );
    }
}
