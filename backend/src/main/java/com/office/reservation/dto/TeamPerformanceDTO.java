package com.office.reservation.dto;

import java.util.List;

public class TeamPerformanceDTO {

    private String managerName;
    private int teamSize;
    private double teamAverageScore;
    private String teamTrend; // overall team trend
    private List<TierDistribution> tierDistribution;
    private List<PerformanceReportDTO> employees;
    private List<String> outlierHighlights; // notable observations

    public TeamPerformanceDTO() {}

    // --- Getters and Setters ---

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public int getTeamSize() { return teamSize; }
    public void setTeamSize(int teamSize) { this.teamSize = teamSize; }

    public double getTeamAverageScore() { return teamAverageScore; }
    public void setTeamAverageScore(double teamAverageScore) { this.teamAverageScore = teamAverageScore; }

    public String getTeamTrend() { return teamTrend; }
    public void setTeamTrend(String teamTrend) { this.teamTrend = teamTrend; }

    public List<TierDistribution> getTierDistribution() { return tierDistribution; }
    public void setTierDistribution(List<TierDistribution> tierDistribution) { this.tierDistribution = tierDistribution; }

    public List<PerformanceReportDTO> getEmployees() { return employees; }
    public void setEmployees(List<PerformanceReportDTO> employees) { this.employees = employees; }

    public List<String> getOutlierHighlights() { return outlierHighlights; }
    public void setOutlierHighlights(List<String> outlierHighlights) { this.outlierHighlights = outlierHighlights; }

    // Inner class for tier breakdown
    public static class TierDistribution {
        private String tier;
        private int count;
        private String color;

        public TierDistribution() {}

        public TierDistribution(String tier, int count, String color) {
            this.tier = tier;
            this.count = count;
            this.color = color;
        }

        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
}
