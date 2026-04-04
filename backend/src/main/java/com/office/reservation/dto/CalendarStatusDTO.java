package com.office.reservation.dto;

import java.time.LocalDate;

public class CalendarStatusDTO {
    private LocalDate date;
    private boolean available;
    private String status; // AVAILABLE, RESTRICTED, CAPACITY_REACHED, BOOKED
    private String reason;
    private double occupancyPercentage;

    public CalendarStatusDTO() {}
    public CalendarStatusDTO(LocalDate date, boolean available, String status, String reason, double occupancyPercentage) {
        this.date = date; this.available = available; this.status = status; this.reason = reason; this.occupancyPercentage = occupancyPercentage;
    }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public double getOccupancyPercentage() { return occupancyPercentage; }
    public void setOccupancyPercentage(double occupancyPercentage) { this.occupancyPercentage = occupancyPercentage; }
}
