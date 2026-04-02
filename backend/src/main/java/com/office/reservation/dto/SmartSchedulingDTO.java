package com.office.reservation.dto;

import java.time.LocalTime;

public class SmartSchedulingDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private double score;
    private String reasoning;
    private String type;
    private Long chairId;
    private Long meetingRoomId;

    public SmartSchedulingDTO() {
    }

    public static SmartSchedulingDTOBuilder builder() {
        return new SmartSchedulingDTOBuilder();
    }

    public SmartSchedulingDTO(LocalTime startTime, LocalTime endTime, double score, String reasoning, String type, Long chairId, Long meetingRoomId) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.score = score;
        this.reasoning = reasoning;
        this.type = type;
        this.chairId = chairId;
        this.meetingRoomId = meetingRoomId;
    }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getChairId() { return chairId; }
    public void setChairId(Long chairId) { this.chairId = chairId; }
    public Long getMeetingRoomId() { return meetingRoomId; }
    public void setMeetingRoomId(Long meetingRoomId) { this.meetingRoomId = meetingRoomId; }

    public static class SmartSchedulingDTOBuilder {
        private LocalTime startTime;
        private LocalTime endTime;
        private double score;
        private String reasoning;
        private String type;
        private Long chairId;
        private Long meetingRoomId;

        public SmartSchedulingDTOBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public SmartSchedulingDTOBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public SmartSchedulingDTOBuilder score(double score) { this.score = score; return this; }
        public SmartSchedulingDTOBuilder reasoning(String reasoning) { this.reasoning = reasoning; return this; }
        public SmartSchedulingDTOBuilder type(String type) { this.type = type; return this; }
        public SmartSchedulingDTOBuilder chairId(Long chairId) { this.chairId = chairId; return this; }
        public SmartSchedulingDTOBuilder meetingRoomId(Long meetingRoomId) { this.meetingRoomId = meetingRoomId; return this; }
        public SmartSchedulingDTO build() { return new SmartSchedulingDTO(startTime, endTime, score, reasoning, type, chairId, meetingRoomId); }
    }
}
