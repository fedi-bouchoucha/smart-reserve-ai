package com.office.reservation.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MeetingRoomBookingRequest {
    private Long meetingRoomId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    public MeetingRoomBookingRequest() {}

    public MeetingRoomBookingRequest(Long meetingRoomId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.meetingRoomId = meetingRoomId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getMeetingRoomId() { return meetingRoomId; }
    public void setMeetingRoomId(Long meetingRoomId) { this.meetingRoomId = meetingRoomId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
