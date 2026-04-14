package com.office.reservation.dto;

import java.util.List;

public class PerformanceReportDTO {

    private Long employeeId;
    private String employeeName;
    private String username;
    private String email;
    private String role;
    private String team; // manager name as team identifier

    // Scores
    private double score;
    private String tier; // "Top Performer", "Solid Performer", etc.
    private String trend; // "improving", "stable", "declining"

    // Trajectory (last N weeks of scores)
    private List<Double> trajectory;
    private List<String> trajectoryLabels; // week labels

    // Driver analysis
    private List<String> positiveDrivers;
    private List<String> negativeDrivers;

    // Metric breakdown
    private double bookingConsistency;
    private double cancellationRate;
    private double changeRequestFrequency;
    private double planningScore;
    private double engagementScore;

    // AI-generated insights
    private String summary;
    private List<String> strengths;
    private List<String> improvements;
    private String trajectoryOutlook;
    private String recommendedAction;

    public PerformanceReportDTO() {}

    // --- Getters and Setters ---

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTeam() { return team; }
    public void setTeam(String team) { this.team = team; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public List<Double> getTrajectory() { return trajectory; }
    public void setTrajectory(List<Double> trajectory) { this.trajectory = trajectory; }

    public List<String> getTrajectoryLabels() { return trajectoryLabels; }
    public void setTrajectoryLabels(List<String> trajectoryLabels) { this.trajectoryLabels = trajectoryLabels; }

    public List<String> getPositiveDrivers() { return positiveDrivers; }
    public void setPositiveDrivers(List<String> positiveDrivers) { this.positiveDrivers = positiveDrivers; }

    public List<String> getNegativeDrivers() { return negativeDrivers; }
    public void setNegativeDrivers(List<String> negativeDrivers) { this.negativeDrivers = negativeDrivers; }

    public double getBookingConsistency() { return bookingConsistency; }
    public void setBookingConsistency(double bookingConsistency) { this.bookingConsistency = bookingConsistency; }

    public double getCancellationRate() { return cancellationRate; }
    public void setCancellationRate(double cancellationRate) { this.cancellationRate = cancellationRate; }

    public double getChangeRequestFrequency() { return changeRequestFrequency; }
    public void setChangeRequestFrequency(double changeRequestFrequency) { this.changeRequestFrequency = changeRequestFrequency; }

    public double getPlanningScore() { return planningScore; }
    public void setPlanningScore(double planningScore) { this.planningScore = planningScore; }

    public double getEngagementScore() { return engagementScore; }
    public void setEngagementScore(double engagementScore) { this.engagementScore = engagementScore; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }

    public String getTrajectoryOutlook() { return trajectoryOutlook; }
    public void setTrajectoryOutlook(String trajectoryOutlook) { this.trajectoryOutlook = trajectoryOutlook; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
