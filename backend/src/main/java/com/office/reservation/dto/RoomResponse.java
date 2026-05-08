package com.office.reservation.dto;

public class RoomResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private Integer floor;

    public RoomResponse() {}

    public RoomResponse(Long id, String name, Integer capacity, Integer floor) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.floor = floor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
}
