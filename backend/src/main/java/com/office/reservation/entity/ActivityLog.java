package com.office.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String loginLocation;

    private String ipAddress;

    private String deviceType;

    private int requestsLastMinute;

    private int bookingActions;

    private int cancellationActions;

    @Column(nullable = false)
    private String status; // NORMAL or ANOMALOUS

    private int riskScore;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private String recommendedAction; // allow, require_verification, block, alert_admin

    public ActivityLog() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getLoginLocation() { return loginLocation; }
    public void setLoginLocation(String loginLocation) { this.loginLocation = loginLocation; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

    public int getRequestsLastMinute() { return requestsLastMinute; }
    public void setRequestsLastMinute(int requestsLastMinute) { this.requestsLastMinute = requestsLastMinute; }

    public int getBookingActions() { return bookingActions; }
    public void setBookingActions(int bookingActions) { this.bookingActions = bookingActions; }

    public int getCancellationActions() { return cancellationActions; }
    public void setCancellationActions(int cancellationActions) { this.cancellationActions = cancellationActions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
