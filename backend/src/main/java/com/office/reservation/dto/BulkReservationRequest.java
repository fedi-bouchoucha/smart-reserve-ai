package com.office.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BulkReservationRequest {
    private Long chairId;
    private Long meetingRoomId;
    private List<LocalDate> dates;
    private LocalTime startTime;
    private LocalTime endTime;

    public BulkReservationRequest() {
    }

    public BulkReservationRequest(Long chairId, Long meetingRoomId, List<LocalDate> dates, LocalTime startTime, LocalTime endTime) {
        this.chairId = chairId;
        this.meetingRoomId = meetingRoomId;
        this.dates = dates;
        this.startTime = startTime;
        this.endTime = endTime;
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

    public List<LocalDate> getDates() {
        return dates;
    }

    public void setDates(List<LocalDate> dates) {
        this.dates = dates;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
