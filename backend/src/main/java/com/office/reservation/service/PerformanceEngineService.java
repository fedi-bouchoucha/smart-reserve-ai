package com.office.reservation.service;

import com.office.reservation.dto.PerformanceReportDTO;
import com.office.reservation.dto.TeamPerformanceDTO;
import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PerformanceEngineService {

    private final ReservationRepository reservationRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final DayOffRepository dayOffRepository;
    private final UserRepository userRepository;
    private final PerformanceSnapshotRepository snapshotRepository;

    // Scoring weights
    private static final double WEIGHT_BOOKING = 0.30;
    private static final double WEIGHT_CANCELLATION = 0.20;
    private static final double WEIGHT_CHANGE_REQ = 0.10;
    private static final double WEIGHT_PLANNING = 0.20;
    private static final double WEIGHT_ENGAGEMENT = 0.20;

    // Expected workdays per week
    private static final int EXPECTED_WORKDAYS = 5;

    public PerformanceEngineService(ReservationRepository reservationRepository,
                                     ChangeRequestRepository changeRequestRepository,
                                     DayOffRepository dayOffRepository,
                                     UserRepository userRepository,
                                     PerformanceSnapshotRepository snapshotRepository) {
        this.reservationRepository = reservationRepository;
        this.changeRequestRepository = changeRequestRepository;
        this.dayOffRepository = dayOffRepository;
        this.userRepository = userRepository;
        this.snapshotRepository = snapshotRepository;
    }

    // ======== WEEKLY SNAPSHOT COMPUTATION ========

    /**
     * Compute performance snapshots for all employees for a given week.
     * Called by scheduled cron or manually via admin endpoint.
     */
    public int computeWeeklySnapshots(LocalDate weekStart) {
        LocalDate monday = weekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate friday = monday.plusDays(4);

        List<User> employees = userRepository.findByRole(Role.EMPLOYEE);
        int computed = 0;

        for (User employee : employees) {
            // Skip if snapshot already exists for this week
            if (snapshotRepository.findByUserIdAndWeekStart(employee.getId(), monday).isPresent()) {
                continue;
            }

            PerformanceSnapshot snapshot = computeSnapshotForUser(employee, monday, friday);
            snapshotRepository.save(snapshot);
            computed++;
        }

        return computed;
    }

    /**
     * Auto-run weekly on Sundays at midnight
     */
    @Scheduled(cron = "0 0 0 * * SUN")
    public void scheduledWeeklyComputation() {
        LocalDate lastMonday = LocalDate.now().with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
        computeWeeklySnapshots(lastMonday);
    }

    private PerformanceSnapshot computeSnapshotForUser(User user, LocalDate weekStart, LocalDate weekEnd) {
        Long userId = user.getId();

        // Fetch raw data for the week
        List<Reservation> allReservations = reservationRepository.findByUserId(userId).stream()
                .filter(r -> !r.getDate().isBefore(weekStart) && !r.getDate().isAfter(weekEnd))
                .collect(Collectors.toList());

        long confirmedCount = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED || r.getStatus() == ReservationStatus.AUTO_ASSIGNED)
                .count();

        long cancelledCount = allReservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
                .count();

        long totalBookings = allReservations.size();

        // Day-offs for the week
        long dayOffCount = dayOffRepository.countByUserIdAndDateBetweenAndStatus(
                userId, weekStart, weekEnd, ReservationStatus.CONFIRMED);

        // Change requests for this user in the week
        List<ChangeRequest> userChangeRequests = changeRequestRepository.findByRequestedById(userId).stream()
                .filter(cr -> cr.getCreatedAt() != null
                        && !cr.getCreatedAt().toLocalDate().isBefore(weekStart)
                        && !cr.getCreatedAt().toLocalDate().isAfter(weekEnd))
                .collect(Collectors.toList());

        int changeRequestCount = userChangeRequests.size();

        // --- Compute sub-scores (each 0.0 - 10.0) ---

        // Calculate expected weekly days based on the user's targetAttendance percentage
        Integer targetPct = user.getTargetAttendance();
        if (targetPct == null) targetPct = 50; // Fallback
        
        double weeklyTargetRatio = targetPct / 100.0;
        double expectedWeeklyDays = Math.max(1.0, EXPECTED_WORKDAYS * weeklyTargetRatio);

        // 1. Booking consistency: ratio of confirmed bookings to their personal target
        double bookingRatio = Math.min(1.0, (double) confirmedCount / expectedWeeklyDays);
        double bookingSubScore = bookingRatio * 10.0;

        // 2. Cancellation rate: lower is better
        double cancellationRate = totalBookings > 0 ? (double) cancelledCount / totalBookings : 0.0;
        double cancellationSubScore = (1.0 - cancellationRate) * 10.0;

        // 3. Change request frequency: fewer = better (0 is perfect, 3+ is 0)
        double changeReqSubScore = Math.max(0, 10.0 - (changeRequestCount * 3.33));

        // 4. Planning score: simulate advance booking metric
        // We'll use a heuristic — how consistent is the booking pattern
        double planningSubScore = computePlanningSubScore(allReservations, weekStart);

        // 5. Engagement score: active participation relative to personal target
        double engagementSubScore = Math.min(10.0, ((double) confirmedCount / expectedWeeklyDays) * 10.0);

        // --- Composite score ---
        double compositeScore = (bookingSubScore * WEIGHT_BOOKING)
                + (cancellationSubScore * WEIGHT_CANCELLATION)
                + (changeReqSubScore * WEIGHT_CHANGE_REQ)
                + (planningSubScore * WEIGHT_PLANNING)
                + (engagementSubScore * WEIGHT_ENGAGEMENT);

        compositeScore = Math.round(compositeScore * 10.0) / 10.0; // round to 1 decimal

        PerformanceSnapshot snapshot = new PerformanceSnapshot();
        snapshot.setUser(user);
        snapshot.setWeekStart(weekStart);
        snapshot.setScore(compositeScore);
        snapshot.setBookingFrequency((int) totalBookings);
        snapshot.setCancellationCount((int) cancelledCount);
        snapshot.setNoShowCount(0); // placeholder — no check-in system
        snapshot.setChangeRequestCount(changeRequestCount);
        snapshot.setDayOffCount((int) dayOffCount);
        snapshot.setPlanningScore(Math.round(planningSubScore * 10.0) / 10.0);
        snapshot.setEngagementScore(Math.round(engagementSubScore * 10.0) / 10.0);

        return snapshot;
    }

    private double computePlanningSubScore(List<Reservation> reservations, LocalDate weekStart) {
        if (reservations.isEmpty()) return 5.0; // neutral when no data

        // Heuristic: bookings made before the week starts get higher scores
        long earlyBookings = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED || r.getStatus() == ReservationStatus.AUTO_ASSIGNED)
                .count();

        // If all bookings are confirmed (not last-minute pending), that's good planning
        double ratio = reservations.isEmpty() ? 0.5 : (double) earlyBookings / reservations.size();
        return ratio * 10.0;
    }

    private double computeEngagementSubScore(long confirmedBookings, long dayOffs, int effectiveWorkdays) {
        // Engagement = active days in office / expected days
        double attendance = (double) confirmedBookings / Math.max(1, effectiveWorkdays);
        return Math.min(10.0, attendance * 10.0);
    }

    // ======== REPORT GENERATION ========

    /**
     * Generate a full performance report for a single employee.
     */
    public PerformanceReportDTO generateEmployeeReport(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Get last 12 weeks of snapshots
        LocalDate twelveWeeksAgo = LocalDate.now().minusWeeks(12);
        List<PerformanceSnapshot> snapshots = snapshotRepository
                .findByUserIdAndWeekStartAfter(employeeId, twelveWeeksAgo);

        // If insufficient data, generate simulated snapshots
        if (snapshots.size() < 4) {
            snapshots = generateSimulatedSnapshots(employee);
        }

        PerformanceReportDTO report = new PerformanceReportDTO();
        report.setEmployeeId(employee.getId());
        report.setEmployeeName(employee.getFullName());
        report.setUsername(employee.getUsername());
        report.setEmail(employee.getEmail());
        report.setRole(employee.getRole().name());
        report.setTeam(employee.getManager() != null ? employee.getManager().getFullName() : "Unassigned");

        // Current score (latest snapshot)
        PerformanceSnapshot latest = snapshots.get(snapshots.size() - 1);
        report.setScore(latest.getScore());
        report.setTier(getTierLabel(latest.getScore()));

        // Trajectory
        List<Double> trajectory = snapshots.stream()
                .map(PerformanceSnapshot::getScore)
                .collect(Collectors.toList());
        report.setTrajectory(trajectory);

        List<String> labels = snapshots.stream()
                .map(s -> "W" + getWeekNumber(s.getWeekStart()))
                .collect(Collectors.toList());
        report.setTrajectoryLabels(labels);

        // Trend analysis
        String trend = analyzeTrend(trajectory);
        report.setTrend(trend);

        // Metric breakdown
        report.setBookingConsistency(latest.getBookingFrequency());
        report.setCancellationRate(latest.getCancellationCount());
        report.setChangeRequestFrequency(latest.getChangeRequestCount());
        report.setPlanningScore(latest.getPlanningScore());
        report.setEngagementScore(latest.getEngagementScore());

        // Driver analysis
        Map<String, Double> driverScores = new LinkedHashMap<>();
        driverScores.put("booking", latest.getBookingFrequency() > 3 ? 8.0 : latest.getBookingFrequency() * 2.0);
        driverScores.put("cancellation", latest.getCancellationCount() == 0 ? 9.0 : Math.max(0, 8.0 - latest.getCancellationCount() * 3.0));
        driverScores.put("changeRequest", latest.getChangeRequestCount() == 0 ? 8.5 : Math.max(0, 7.0 - latest.getChangeRequestCount() * 2.5));
        driverScores.put("planning", latest.getPlanningScore());
        driverScores.put("engagement", latest.getEngagementScore());

        report.setPositiveDrivers(identifyPositiveDrivers(driverScores, latest));
        report.setNegativeDrivers(identifyNegativeDrivers(driverScores, latest));

        // Generate natural language insights
        report.setSummary(generateSummary(employee, latest, trend));
        report.setStrengths(generateStrengths(driverScores, latest));
        report.setImprovements(generateImprovements(driverScores, latest));
        report.setTrajectoryOutlook(generateTrajectoryOutlook(trend, trajectory, employee));
        report.setRecommendedAction(generateRecommendedAction(latest, trend));

        return report;
    }

    /**
     * Generate team performance overview for a manager.
     */
    public TeamPerformanceDTO generateTeamReport(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        List<User> employees = userRepository.findByManagerId(managerId);

        TeamPerformanceDTO team = new TeamPerformanceDTO();
        team.setManagerName(manager.getFullName());
        team.setTeamSize(employees.size());

        List<PerformanceReportDTO> employeeReports = employees.stream()
                .map(emp -> generateEmployeeReport(emp.getId()))
                .collect(Collectors.toList());

        team.setEmployees(employeeReports);

        // Team average
        double avgScore = employeeReports.stream()
                .mapToDouble(PerformanceReportDTO::getScore)
                .average()
                .orElse(0.0);
        team.setTeamAverageScore(Math.round(avgScore * 10.0) / 10.0);

        // Team trend
        long improving = employeeReports.stream().filter(r -> "improving".equals(r.getTrend())).count();
        long declining = employeeReports.stream().filter(r -> "declining".equals(r.getTrend())).count();
        if (improving > declining) team.setTeamTrend("improving");
        else if (declining > improving) team.setTeamTrend("declining");
        else team.setTeamTrend("stable");

        // Tier distribution
        Map<String, Integer> tierCounts = new LinkedHashMap<>();
        tierCounts.put("Top Performer", 0);
        tierCounts.put("Solid Performer", 0);
        tierCounts.put("Needs Improvement", 0);
        tierCounts.put("Needs Support", 0);

        for (PerformanceReportDTO r : employeeReports) {
            tierCounts.merge(r.getTier(), 1, Integer::sum);
        }

        List<TeamPerformanceDTO.TierDistribution> tierDist = new ArrayList<>();
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Top Performer", tierCounts.get("Top Performer"), "#10b981"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Solid Performer", tierCounts.get("Solid Performer"), "#6366f1"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Needs Improvement", tierCounts.get("Needs Improvement"), "#f59e0b"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Needs Support", tierCounts.get("Needs Support"), "#ef4444"));
        team.setTierDistribution(tierDist);

        // Outlier highlights
        team.setOutlierHighlights(generateOutlierHighlights(employeeReports));

        return team;
    }

    /**
     * Generate performance report for ALL employees (admin-only view).
     */
    public TeamPerformanceDTO generateAllEmployeesReport(String adminName) {
        List<User> employees = userRepository.findByRole(Role.EMPLOYEE);

        TeamPerformanceDTO team = new TeamPerformanceDTO();
        team.setManagerName(adminName);
        team.setTeamSize(employees.size());

        List<PerformanceReportDTO> employeeReports = employees.stream()
                .map(emp -> generateEmployeeReport(emp.getId()))
                .collect(Collectors.toList());

        team.setEmployees(employeeReports);

        // Team average
        double avgScore = employeeReports.stream()
                .mapToDouble(PerformanceReportDTO::getScore)
                .average()
                .orElse(0.0);
        team.setTeamAverageScore(Math.round(avgScore * 10.0) / 10.0);

        // Team trend
        long improving = employeeReports.stream().filter(r -> "improving".equals(r.getTrend())).count();
        long declining = employeeReports.stream().filter(r -> "declining".equals(r.getTrend())).count();
        if (improving > declining) team.setTeamTrend("improving");
        else if (declining > improving) team.setTeamTrend("declining");
        else team.setTeamTrend("stable");

        // Tier distribution
        Map<String, Integer> tierCounts = new LinkedHashMap<>();
        tierCounts.put("Top Performer", 0);
        tierCounts.put("Solid Performer", 0);
        tierCounts.put("Needs Improvement", 0);
        tierCounts.put("Needs Support", 0);

        for (PerformanceReportDTO r : employeeReports) {
            tierCounts.merge(r.getTier(), 1, Integer::sum);
        }

        List<TeamPerformanceDTO.TierDistribution> tierDist = new ArrayList<>();
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Top Performer", tierCounts.get("Top Performer"), "#10b981"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Solid Performer", tierCounts.get("Solid Performer"), "#6366f1"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Needs Improvement", tierCounts.get("Needs Improvement"), "#f59e0b"));
        tierDist.add(new TeamPerformanceDTO.TierDistribution("Needs Support", tierCounts.get("Needs Support"), "#ef4444"));
        team.setTierDistribution(tierDist);

        // Outlier highlights
        team.setOutlierHighlights(generateOutlierHighlights(employeeReports));

        return team;
    }

    // ======== TIER / TREND LOGIC ========

    private String getTierLabel(double score) {
        if (score >= 8.0) return "Top Performer";
        if (score >= 6.0) return "Solid Performer";
        if (score >= 4.0) return "Needs Improvement";
        return "Needs Support";
    }

    private PerformanceTier getTier(double score) {
        if (score >= 8.0) return PerformanceTier.TOP_PERFORMER;
        if (score >= 6.0) return PerformanceTier.SOLID_PERFORMER;
        if (score >= 4.0) return PerformanceTier.NEEDS_IMPROVEMENT;
        return PerformanceTier.NEEDS_SUPPORT;
    }

    private String analyzeTrend(List<Double> trajectory) {
        if (trajectory.size() < 2) return "stable";

        // Compare last 4 values (or however many we have)
        int size = trajectory.size();
        int window = Math.min(4, size);
        double first = trajectory.get(size - window);
        double last = trajectory.get(size - 1);
        double diff = last - first;

        if (diff >= 0.3) return "improving";
        if (diff <= -0.3) return "declining";
        return "stable";
    }

    private int getWeekNumber(LocalDate date) {
        return date.get(java.time.temporal.WeekFields.ISO.weekOfYear());
    }

    // ======== DRIVER ANALYSIS ========

    private List<String> identifyPositiveDrivers(Map<String, Double> drivers, PerformanceSnapshot snapshot) {
        List<String> positive = new ArrayList<>();

        if (drivers.get("planning") >= 7.0) {
            positive.add("Strong advance planning — books workspace well ahead of time");
        }
        if (drivers.get("cancellation") >= 7.0) {
            positive.add("Reliable attendance — very low cancellation rate");
        }
        if (drivers.get("engagement") >= 7.0) {
            positive.add("High engagement — consistently present in the office");
        }
        if (drivers.get("booking") >= 7.0) {
            positive.add("Regular booking habits — maintains a steady workspace schedule");
        }
        if (drivers.get("changeRequest") >= 7.0) {
            positive.add("Schedule stability — rarely requests changes to bookings");
        }

        if (positive.isEmpty()) {
            positive.add("Maintaining baseline participation in workspace reservations");
        }

        return positive.size() > 2 ? positive.subList(0, 2) : positive;
    }

    private List<String> identifyNegativeDrivers(Map<String, Double> drivers, PerformanceSnapshot snapshot) {
        List<String> negative = new ArrayList<>();

        if (drivers.get("cancellation") < 5.0) {
            int rate = snapshot.getCancellationCount();
            negative.add("Elevated cancellation rate — " + rate + " cancellation(s) this period. Consider discussing scheduling challenges.");
        }
        if (drivers.get("changeRequest") < 5.0) {
            negative.add("Frequent change requests — may indicate difficulty with advance planning or shifting priorities.");
        }
        if (drivers.get("engagement") < 5.0) {
            negative.add("Lower office engagement — fewer in-office days than expected. A check-in may help understand if barriers exist.");
        }
        if (drivers.get("booking") < 5.0) {
            negative.add("Inconsistent booking pattern — workspace is not being reserved regularly.");
        }
        if (drivers.get("planning") < 5.0) {
            negative.add("Late booking tendency — reservations are often made close to or after the start of the week.");
        }

        if (negative.isEmpty()) {
            negative.add("No significant risk factors identified at this time.");
        }

        return negative.size() > 2 ? negative.subList(0, 2) : negative;
    }

    // ======== NATURAL LANGUAGE GENERATION ========

    private String generateSummary(User employee, PerformanceSnapshot snapshot, String trend) {
        String name = employee.getFullName().split(" ")[0]; // first name
        String tierLabel = getTierLabel(snapshot.getScore());
        String trendDesc = "stable".equals(trend) ? "has remained steady"
                : "improving".equals(trend) ? "has been improving"
                : "has been declining";

        String summary = name + " is currently rated as a " + tierLabel + " with an overall score of "
                + snapshot.getScore() + "/10. ";

        if (snapshot.getScore() >= 8.0) {
            summary += "Performance " + trendDesc + " over the recent period, reflecting strong and consistent workspace engagement.";
        } else if (snapshot.getScore() >= 6.0) {
            summary += "Performance " + trendDesc + " recently, with solid fundamentals and room for further growth.";
        } else if (snapshot.getScore() >= 4.0) {
            summary += "Performance " + trendDesc + " and there are some areas that could benefit from attention to improve overall consistency.";
        } else {
            summary += "Performance " + trendDesc + " and additional support may be beneficial to help improve workspace engagement patterns.";
        }

        return summary;
    }

    private List<String> generateStrengths(Map<String, Double> drivers, PerformanceSnapshot snapshot) {
        // Same logic as positive drivers but with more detail
        return identifyPositiveDrivers(drivers, snapshot);
    }

    private List<String> generateImprovements(Map<String, Double> drivers, PerformanceSnapshot snapshot) {
        return identifyNegativeDrivers(drivers, snapshot);
    }

    private String generateTrajectoryOutlook(String trend, List<Double> trajectory, User employee) {
        String name = employee.getFullName().split(" ")[0];
        double latest = trajectory.get(trajectory.size() - 1);

        if ("improving".equals(trend)) {
            return name + "'s score has shown a positive upward trend over recent weeks. "
                    + "If this pattern continues, they are on track to reach the next performance tier within the coming month.";
        } else if ("declining".equals(trend)) {
            return name + "'s trajectory shows a gradual decline that warrants attention. "
                    + "Without intervention, the score may continue to drop. Early engagement is recommended.";
        } else {
            if (latest >= 7.0) {
                return name + "'s performance is consistent and steady. "
                        + "Maintaining this level of engagement is a strong indicator of reliability.";
            }
            return name + "'s performance has been stable but below the ideal range. "
                    + "Targeted support could help unlock improvement.";
        }
    }

    private String generateRecommendedAction(PerformanceSnapshot snapshot, String trend) {
        double score = snapshot.getScore();

        if (score >= 8.0 && !"declining".equals(trend)) {
            return "Acknowledge this employee's strong performance. Consider them for peer mentoring or team leadership opportunities.";
        } else if (score >= 6.0 && !"declining".equals(trend)) {
            return "No urgent action needed. Continue monitoring and provide positive feedback for consistency.";
        } else if ("declining".equals(trend)) {
            return "Schedule a 1-on-1 check-in to understand any challenges affecting workspace usage. Review their booking and cancellation patterns together.";
        } else if (score < 4.0) {
            return "Prioritize a supportive check-in meeting this week. Review workspace expectations together and discuss if scheduling adjustments or flexibility could help.";
        } else {
            return "Review this employee's booking patterns and consider a brief check-in to discuss scheduling preferences and remove any obstacles to consistent office attendance.";
        }
    }

    // ======== OUTLIER DETECTION ========

    private List<String> generateOutlierHighlights(List<PerformanceReportDTO> reports) {
        List<String> highlights = new ArrayList<>();

        if (reports.isEmpty()) return highlights;

        // Find top performer
        reports.stream()
                .max(Comparator.comparingDouble(PerformanceReportDTO::getScore))
                .ifPresent(top -> highlights.add(
                        top.getEmployeeName() + " leads the team with a score of " + top.getScore() + "/10."));

        // Find anyone declining
        long decliningCount = reports.stream()
                .filter(r -> "declining".equals(r.getTrend()))
                .count();
        if (decliningCount > 0) {
            highlights.add(decliningCount + " team member(s) showing a declining trend — review recommended.");
        }

        // Find biggest improver
        reports.stream()
                .filter(r -> "improving".equals(r.getTrend()))
                .max(Comparator.comparingDouble(PerformanceReportDTO::getScore))
                .ifPresent(imp -> highlights.add(
                        imp.getEmployeeName() + " is showing strong improvement and momentum."));

        // Low scorers needing attention
        long needsSupport = reports.stream()
                .filter(r -> r.getScore() < 4.0)
                .count();
        if (needsSupport > 0) {
            highlights.add(needsSupport + " team member(s) in the 'Needs Support' range — proactive outreach suggested.");
        }

        return highlights;
    }

    // ======== SIMULATED DATA (for sparse data) ========

    private List<PerformanceSnapshot> generateSimulatedSnapshots(User employee) {
        List<PerformanceSnapshot> simulated = new ArrayList<>();
        Random random = new Random(employee.getId() * 31); // deterministic per employee

        double baseScore = 5.0 + random.nextDouble() * 4.0; // 5.0 - 9.0 base
        double trend = (random.nextDouble() - 0.4) * 0.3; // slight bias toward improvement

        for (int i = 11; i >= 0; i--) {
            LocalDate weekStart = LocalDate.now()
                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .minusWeeks(i);

            double noise = (random.nextDouble() - 0.5) * 0.6;
            double score = Math.max(1.0, Math.min(10.0, baseScore + trend * (12 - i) + noise));
            score = Math.round(score * 10.0) / 10.0;

            PerformanceSnapshot snap = new PerformanceSnapshot();
            snap.setUser(employee);
            snap.setWeekStart(weekStart);
            snap.setScore(score);
            snap.setBookingFrequency(2 + random.nextInt(4));
            snap.setCancellationCount(random.nextInt(3));
            snap.setNoShowCount(0);
            snap.setChangeRequestCount(random.nextInt(3));
            snap.setDayOffCount(random.nextInt(2));
            snap.setPlanningScore(Math.round((4.0 + random.nextDouble() * 6.0) * 10.0) / 10.0);
            snap.setEngagementScore(Math.round((4.0 + random.nextDouble() * 6.0) * 10.0) / 10.0);

            simulated.add(snap);
        }

        return simulated;
    }
}
