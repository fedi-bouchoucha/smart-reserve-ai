package com.office.reservation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DayOffResponse {
    private Long id;
    private Long userId;
    private String userName;
    private LocalDate date;
    private String status;
    private LocalDateTime createdAt;

    public DayOffResponse() {}

    public DayOffResponse(Long id, Long userId, String userName, LocalDate date, String status, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.date = date;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
