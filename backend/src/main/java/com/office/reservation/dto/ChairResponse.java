package com.office.reservation.dto;

public class ChairResponse {
    private Long id;
    private Integer number;
    private Long emplacementId;
    private String emplacementName;
    private Integer floor;

    public ChairResponse() {}

    public ChairResponse(Long id, Integer number, Long emplacementId, String emplacementName, Integer floor) {
        this.id = id;
        this.number = number;
        this.emplacementId = emplacementId;
        this.emplacementName = emplacementName;
        this.floor = floor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumber() { return number; }
    public void setNumber(Integer number) { this.number = number; }
    public Long getEmplacementId() { return emplacementId; }
    public void setEmplacementId(Long emplacementId) { this.emplacementId = emplacementId; }
    public String getEmplacementName() { return emplacementName; }
    public void setEmplacementName(String emplacementName) { this.emplacementName = emplacementName; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
}
