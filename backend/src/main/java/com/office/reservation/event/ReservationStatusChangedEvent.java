package com.office.reservation.event;

import com.office.reservation.entity.User;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDate;

public class ReservationStatusChangedEvent extends ApplicationEvent {

    private final User user;
    private final Long reservationId;
    private final String resourceInfo; // Desk/Room info
    private final LocalDate date;
    private final String status; // APPROVED, REJECTED, CANCELLED
    private final String managerComment;

    public ReservationStatusChangedEvent(Object source, User user, Long reservationId, String resourceInfo, LocalDate date, String status, String managerComment) {
        super(source);
        this.user = user;
        this.reservationId = reservationId;
        this.resourceInfo = resourceInfo;
        this.date = date;
        this.status = status;
        this.managerComment = managerComment;
    }

    public User getUser() {
        return user;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public String getResourceInfo() {
        return resourceInfo;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public String getManagerComment() {
        return managerComment;
    }
}
