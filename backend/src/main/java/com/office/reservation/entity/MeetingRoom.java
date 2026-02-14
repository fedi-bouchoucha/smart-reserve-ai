package com.office.reservation.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "meeting_rooms")
public class MeetingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private Integer capacity;

    private Integer floor;

    public MeetingRoom() {
    }

    public MeetingRoom(Long id, String name, Integer capacity, Integer floor) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.floor = floor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public static MeetingRoomBuilder builder() {
        return new MeetingRoomBuilder();
    }

    public static class MeetingRoomBuilder {
        private Long id;
        private String name;
        private Integer capacity;
        private Integer floor;

        public MeetingRoomBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public MeetingRoomBuilder name(String name) {
            this.name = name;
            return this;
        }

        public MeetingRoomBuilder capacity(Integer capacity) {
            this.capacity = capacity;
            return this;
        }

        public MeetingRoomBuilder floor(Integer floor) {
            this.floor = floor;
            return this;
        }

        public MeetingRoom build() {
            return new MeetingRoom(id, name, capacity, floor);
        }
    }
}
