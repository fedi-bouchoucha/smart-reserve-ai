package com.office.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chair_id")
    private Chair chair;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_room_id")
    private MeetingRoom meetingRoom;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    public Reservation() {
    }

    public Reservation(Long id, User user, Chair chair, MeetingRoom meetingRoom, LocalDate date,
            ReservationStatus status) {
        this.id = id;
        this.user = user;
        this.chair = chair;
        this.meetingRoom = meetingRoom;
        this.date = date;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Chair getChair() {
        return chair;
    }

    public void setChair(Chair chair) {
        this.chair = chair;
    }

    public MeetingRoom getMeetingRoom() {
        return meetingRoom;
    }

    public void setMeetingRoom(MeetingRoom meetingRoom) {
        this.meetingRoom = meetingRoom;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public static ReservationBuilder builder() {
        return new ReservationBuilder();
    }

    public static class ReservationBuilder {
        private Long id;
        private User user;
        private Chair chair;
        private MeetingRoom meetingRoom;
        private LocalDate date;
        private ReservationStatus status;

        public ReservationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReservationBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ReservationBuilder chair(Chair chair) {
            this.chair = chair;
            return this;
        }

        public ReservationBuilder meetingRoom(MeetingRoom meetingRoom) {
            this.meetingRoom = meetingRoom;
            return this;
        }

        public ReservationBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public ReservationBuilder status(ReservationStatus status) {
            this.status = status;
            return this;
        }

        public Reservation build() {
            return new Reservation(id, user, chair, meetingRoom, date, status);
        }
    }
}
