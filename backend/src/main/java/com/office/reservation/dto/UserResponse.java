package com.office.reservation.dto;

public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String profilePicture;
    private String role;
    private Long managerId;
    private String managerName;
    private boolean archived;
    private Integer targetAttendance;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String fullName, String email, String profilePicture, String role, Long managerId,
            String managerName, boolean archived, Integer targetAttendance) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.profilePicture = profilePicture;
        this.role = role;
        this.managerId = managerId;
        this.managerName = managerName;
        this.archived = archived;
        this.targetAttendance = targetAttendance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public Integer getTargetAttendance() {
        return targetAttendance;
    }

    public void setTargetAttendance(Integer targetAttendance) {
        this.targetAttendance = targetAttendance;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static class UserResponseBuilder {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String profilePicture;
        private String role;
        private Long managerId;
        private String managerName;
        private boolean archived;
        private Integer targetAttendance;

        public UserResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserResponseBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public UserResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserResponseBuilder profilePicture(String profilePicture) {
            this.profilePicture = profilePicture;
            return this;
        }

        public UserResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserResponseBuilder managerId(Long managerId) {
            this.managerId = managerId;
            return this;
        }

        public UserResponseBuilder managerName(String managerName) {
            this.managerName = managerName;
            return this;
        }

        public UserResponseBuilder archived(boolean archived) {
            this.archived = archived;
            return this;
        }

        public UserResponseBuilder targetAttendance(Integer targetAttendance) {
            this.targetAttendance = targetAttendance;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(id, username, fullName, email, profilePicture, role, managerId, managerName, archived, targetAttendance);
        }
    }
}
