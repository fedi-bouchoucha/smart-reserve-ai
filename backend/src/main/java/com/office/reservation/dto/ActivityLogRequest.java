package com.office.reservation.dto;

public class ActivityLogRequest {

    private Long userId;
    private String username;
    private String timestamp; // ISO format
    private String loginLocation; // "Country/City"
    private String ipAddress;
    private String deviceType;
    private int requestsLastMinute;
    private int bookingActions;
    private int cancellationActions;

    public ActivityLogRequest() {}

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

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
}
