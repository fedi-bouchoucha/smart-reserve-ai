package com.office.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "change_requests")
public class ChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    private LocalDate newDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_chair_id")
    private Chair newChair;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "new_meeting_room_id")
    private MeetingRoom newMeetingRoom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChangeRequestStatus status;

    private String managerComment;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public ChangeRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public User getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }

    public LocalDate getNewDate() {
        return newDate;
    }

    public void setNewDate(LocalDate newDate) {
        this.newDate = newDate;
    }

    public Chair getNewChair() {
        return newChair;
    }

    public void setNewChair(Chair newChair) {
        this.newChair = newChair;
    }

    public MeetingRoom getNewMeetingRoom() {
        return newMeetingRoom;
    }

    public void setNewMeetingRoom(MeetingRoom newMeetingRoom) {
        this.newMeetingRoom = newMeetingRoom;
    }

    public ChangeRequestStatus getStatus() {
        return status;
    }

    public void setStatus(ChangeRequestStatus status) {
        this.status = status;
    }

    public String getManagerComment() {
        return managerComment;
    }

    public void setManagerComment(String managerComment) {
        this.managerComment = managerComment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
