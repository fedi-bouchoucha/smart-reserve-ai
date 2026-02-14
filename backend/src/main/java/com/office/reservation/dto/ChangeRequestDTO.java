package com.office.reservation.dto;

import java.time.LocalDate;

public class ChangeRequestDTO {
    private Long reservationId;
    private LocalDate newDate;
    private Long newChairId;
    private Long newMeetingRoomId;

    public ChangeRequestDTO() {
    }

    public ChangeRequestDTO(Long reservationId, LocalDate newDate, Long newChairId, Long newMeetingRoomId) {
        this.reservationId = reservationId;
        this.newDate = newDate;
        this.newChairId = newChairId;
        this.newMeetingRoomId = newMeetingRoomId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public LocalDate getNewDate() {
        return newDate;
    }

    public void setNewDate(LocalDate newDate) {
        this.newDate = newDate;
    }

    public Long getNewChairId() {
        return newChairId;
    }

    public void setNewChairId(Long newChairId) {
        this.newChairId = newChairId;
    }

    public Long getNewMeetingRoomId() {
        return newMeetingRoomId;
    }

    public void setNewMeetingRoomId(Long newMeetingRoomId) {
        this.newMeetingRoomId = newMeetingRoomId;
    }
}
