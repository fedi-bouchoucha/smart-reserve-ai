package com.office.reservation.dto;

import java.util.List;

public class AutoAssignmentResponse {
    private int targetYear;
    private int targetMonth;
    private int totalEmployeesProcessed;
    private int totalReservationsCreated;
    private List<String> skippedEmployees;
    private List<String> warnings;

    public AutoAssignmentResponse() {}

    public AutoAssignmentResponse(int targetYear, int targetMonth, int totalEmployeesProcessed,
                                   int totalReservationsCreated, List<String> skippedEmployees,
                                   List<String> warnings) {
        this.targetYear = targetYear;
        this.targetMonth = targetMonth;
        this.totalEmployeesProcessed = totalEmployeesProcessed;
        this.totalReservationsCreated = totalReservationsCreated;
        this.skippedEmployees = skippedEmployees;
        this.warnings = warnings;
    }

    public int getTargetYear() { return targetYear; }
    public void setTargetYear(int targetYear) { this.targetYear = targetYear; }
    public int getTargetMonth() { return targetMonth; }
    public void setTargetMonth(int targetMonth) { this.targetMonth = targetMonth; }
    public int getTotalEmployeesProcessed() { return totalEmployeesProcessed; }
    public void setTotalEmployeesProcessed(int totalEmployeesProcessed) { this.totalEmployeesProcessed = totalEmployeesProcessed; }
    public int getTotalReservationsCreated() { return totalReservationsCreated; }
    public void setTotalReservationsCreated(int totalReservationsCreated) { this.totalReservationsCreated = totalReservationsCreated; }
    public List<String> getSkippedEmployees() { return skippedEmployees; }
    public void setSkippedEmployees(List<String> skippedEmployees) { this.skippedEmployees = skippedEmployees; }
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
}
