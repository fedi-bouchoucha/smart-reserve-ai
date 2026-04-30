package com.office.reservation.dto;

import java.util.List;

public class RecommendationRequest {

    private String userId;
    private UserPreferences userPreferences;
    private HistoricalBehavior historicalBehavior;
    private CurrentRequest currentRequest;
    private List<RealTimeAvailability> realTimeAvailability;

    public RecommendationRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public UserPreferences getUserPreferences() { return userPreferences; }
    public void setUserPreferences(UserPreferences userPreferences) { this.userPreferences = userPreferences; }

    public HistoricalBehavior getHistoricalBehavior() { return historicalBehavior; }
    public void setHistoricalBehavior(HistoricalBehavior historicalBehavior) { this.historicalBehavior = historicalBehavior; }

    public CurrentRequest getCurrentRequest() { return currentRequest; }
    public void setCurrentRequest(CurrentRequest currentRequest) { this.currentRequest = currentRequest; }

    public List<RealTimeAvailability> getRealTimeAvailability() { return realTimeAvailability; }
    public void setRealTimeAvailability(List<RealTimeAvailability> realTimeAvailability) { this.realTimeAvailability = realTimeAvailability; }

    public static class UserPreferences {
        private String preferredZone;
        private String preferredFloor;
        private List<String> equipmentNeeds;

        public UserPreferences() {}

        public String getPreferredZone() { return preferredZone; }
        public void setPreferredZone(String preferredZone) { this.preferredZone = preferredZone; }

        public String getPreferredFloor() { return preferredFloor; }
        public void setPreferredFloor(String preferredFloor) { this.preferredFloor = preferredFloor; }

        public List<String> getEquipmentNeeds() { return equipmentNeeds; }
        public void setEquipmentNeeds(List<String> equipmentNeeds) { this.equipmentNeeds = equipmentNeeds; }
    }

    public static class HistoricalBehavior {
        private List<String> frequentlyBookedDesks;
        private List<String> frequentlyUsedRooms;
        private List<String> teamMembers;

        public HistoricalBehavior() {}

        public List<String> getFrequentlyBookedDesks() { return frequentlyBookedDesks; }
        public void setFrequentlyBookedDesks(List<String> frequentlyBookedDesks) { this.frequentlyBookedDesks = frequentlyBookedDesks; }

        public List<String> getFrequentlyUsedRooms() { return frequentlyUsedRooms; }
        public void setFrequentlyUsedRooms(List<String> frequentlyUsedRooms) { this.frequentlyUsedRooms = frequentlyUsedRooms; }

        public List<String> getTeamMembers() { return teamMembers; }
        public void setTeamMembers(List<String> teamMembers) { this.teamMembers = teamMembers; }
    }

    public static class CurrentRequest {
        private String date;
        private String timeSlot;
        private String type; // "desk" or "meeting_room"
        private Integer numberOfPeople;

        public CurrentRequest() {}

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Integer getNumberOfPeople() { return numberOfPeople; }
        public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }
    }

    public static class RealTimeAvailability {
        private String id;
        private String zone;
        private String floor;
        private Integer capacity;
        private List<String> equipment;
        private Boolean proximityToTeam;

        public RealTimeAvailability() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getZone() { return zone; }
        public void setZone(String zone) { this.zone = zone; }

        public String getFloor() { return floor; }
        public void setFloor(String floor) { this.floor = floor; }

        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }

        public List<String> getEquipment() { return equipment; }
        public void setEquipment(List<String> equipment) { this.equipment = equipment; }

        public Boolean getProximityToTeam() { return proximityToTeam; }
        public void setProximityToTeam(Boolean proximityToTeam) { this.proximityToTeam = proximityToTeam; }
    }
}
