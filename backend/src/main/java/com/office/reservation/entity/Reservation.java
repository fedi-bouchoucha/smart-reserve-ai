package com.office.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "chair_id")
    private Chair chair;

    @ManyToOne
    @JoinColumn(name = "meeting_room_id")
    private MeetingRoom meetingRoom;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    public Reservation() {}

    public Reservation(User user, Chair chair, MeetingRoom meetingRoom, LocalDate date, LocalTime startTime, LocalTime endTime, ReservationStatus status) {
        this.user = user;
        this.chair = chair;
        this.meetingRoom = meetingRoom;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public static ReservationBuilder builder() {
        return new ReservationBuilder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Chair getChair() { return chair; }
    public void setChair(Chair chair) { this.chair = chair; }
    public MeetingRoom getMeetingRoom() { return meetingRoom; }
    public void setMeetingRoom(MeetingRoom meetingRoom) { this.meetingRoom = meetingRoom; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public static class ReservationBuilder {
        private User user;
        private Chair chair;
        private MeetingRoom meetingRoom;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private ReservationStatus status;

        public ReservationBuilder user(User user) { this.user = user; return this; }
        public ReservationBuilder chair(Chair chair) { this.chair = chair; return this; }
        public ReservationBuilder meetingRoom(MeetingRoom meetingRoom) { this.meetingRoom = meetingRoom; return this; }
        public ReservationBuilder date(LocalDate date) { this.date = date; return this; }
        public ReservationBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public ReservationBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public ReservationBuilder status(ReservationStatus status) { this.status = status; return this; }
        public Reservation build() { return new Reservation(user, chair, meetingRoom, date, startTime, endTime, status); }
    }
}
