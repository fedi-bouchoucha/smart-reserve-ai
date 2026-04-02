package com.office.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ReservationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long chairId;
    private String chairInfo;
    private Long meetingRoomId;
    private String meetingRoomName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;

    public ReservationResponse() {
    }

    public static ReservationResponseBuilder builder() {
        return new ReservationResponseBuilder();
    }

    public ReservationResponse(Long id, Long userId, String userName, Long chairId, String chairInfo, Long meetingRoomId, String meetingRoomName, LocalDate date, LocalTime startTime, LocalTime endTime, String status) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.chairId = chairId;
        this.chairInfo = chairInfo;
        this.meetingRoomId = meetingRoomId;
        this.meetingRoomName = meetingRoomName;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public Long getChairId() { return chairId; }
    public String getChairInfo() { return chairInfo; }
    public Long getMeetingRoomId() { return meetingRoomId; }
    public String getMeetingRoomName() { return meetingRoomName; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getStatus() { return status; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setChairId(Long chairId) { this.chairId = chairId; }
    public void setChairInfo(String chairInfo) { this.chairInfo = chairInfo; }
    public void setMeetingRoomId(Long meetingRoomId) { this.meetingRoomId = meetingRoomId; }
    public void setMeetingRoomName(String meetingRoomName) { this.meetingRoomName = meetingRoomName; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(String status) { this.status = status; }

    public static class ReservationResponseBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private Long chairId;
        private String chairInfo;
        private Long meetingRoomId;
        private String meetingRoomName;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;

        public ReservationResponseBuilder id(Long id) { this.id = id; return this; }
        public ReservationResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public ReservationResponseBuilder userName(String userName) { this.userName = userName; return this; }
        public ReservationResponseBuilder chairId(Long chairId) { this.chairId = chairId; return this; }
        public ReservationResponseBuilder chairInfo(String chairInfo) { this.chairInfo = chairInfo; return this; }
        public ReservationResponseBuilder meetingRoomId(Long meetingRoomId) { this.meetingRoomId = meetingRoomId; return this; }
        public ReservationResponseBuilder meetingRoomName(String meetingRoomName) { this.meetingRoomName = meetingRoomName; return this; }
        public ReservationResponseBuilder date(LocalDate date) { this.date = date; return this; }
        public ReservationResponseBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public ReservationResponseBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public ReservationResponseBuilder status(String status) { this.status = status; return this; }
        public ReservationResponse build() { return new ReservationResponse(id, userId, userName, chairId, chairInfo, meetingRoomId, meetingRoomName, date, startTime, endTime, status); }
    }
}
