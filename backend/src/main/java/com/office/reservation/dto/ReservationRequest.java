package com.office.reservation.dto;

import java.time.LocalDate;

public class ReservationRequest {
    private Long chairId;
    private Long meetingRoomId;
    private LocalDate date;

    public ReservationRequest() {
    }

    public ReservationRequest(Long chairId, Long meetingRoomId, LocalDate date) {
        this.chairId = chairId;
        this.meetingRoomId = meetingRoomId;
        this.date = date;
    }

    public Long getChairId() {
        return chairId;
    }

    public void setChairId(Long chairId) {
        this.chairId = chairId;
    }

    public Long getMeetingRoomId() {
        return meetingRoomId;
    }

    public void setMeetingRoomId(Long meetingRoomId) {
        this.meetingRoomId = meetingRoomId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
