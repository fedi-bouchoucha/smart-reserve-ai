package com.office.reservation.dto;

import java.time.LocalDate;

public class ReservationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long chairId;
    private String chairInfo;
    private Long meetingRoomId;
    private String meetingRoomName;
    private LocalDate date;
    private String status;

    public ReservationResponse() {
    }

    public ReservationResponse(Long id, Long userId, String userName, Long chairId, String chairInfo,
            Long meetingRoomId, String meetingRoomName, LocalDate date, String status) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.chairId = chairId;
        this.chairInfo = chairInfo;
        this.meetingRoomId = meetingRoomId;
        this.meetingRoomName = meetingRoomName;
        this.date = date;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getChairId() {
        return chairId;
    }

    public void setChairId(Long chairId) {
        this.chairId = chairId;
    }

    public String getChairInfo() {
        return chairInfo;
    }

    public void setChairInfo(String chairInfo) {
        this.chairInfo = chairInfo;
    }

    public Long getMeetingRoomId() {
        return meetingRoomId;
    }

    public void setMeetingRoomId(Long meetingRoomId) {
        this.meetingRoomId = meetingRoomId;
    }

    public String getMeetingRoomName() {
        return meetingRoomName;
    }

    public void setMeetingRoomName(String meetingRoomName) {
        this.meetingRoomName = meetingRoomName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static ReservationResponseBuilder builder() {
        return new ReservationResponseBuilder();
    }

    public static class ReservationResponseBuilder {
        private Long id;
        private Long userId;
        private String userName;
        private Long chairId;
        private String chairInfo;
        private Long meetingRoomId;
        private String meetingRoomName;
        private LocalDate date;
        private String status;

        public ReservationResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReservationResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ReservationResponseBuilder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public ReservationResponseBuilder chairId(Long chairId) {
            this.chairId = chairId;
            return this;
        }

        public ReservationResponseBuilder chairInfo(String chairInfo) {
            this.chairInfo = chairInfo;
            return this;
        }

        public ReservationResponseBuilder meetingRoomId(Long meetingRoomId) {
            this.meetingRoomId = meetingRoomId;
            return this;
        }

        public ReservationResponseBuilder meetingRoomName(String meetingRoomName) {
            this.meetingRoomName = meetingRoomName;
            return this;
        }

        public ReservationResponseBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ReservationResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ReservationResponse build() {
            return new ReservationResponse(id, userId, userName, chairId, chairInfo, meetingRoomId, meetingRoomName,
                    date, status);
        }
    }
}
