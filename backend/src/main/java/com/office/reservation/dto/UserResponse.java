package com.office.reservation.dto;

public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Long managerId;
    private String managerName;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String fullName, String email, String role, Long managerId,
            String managerName) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.managerId = managerId;
        this.managerName = managerName;
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

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static class UserResponseBuilder {
        private Long id;
        private String username;
        private String fullName;
        private String email;
        private String role;
        private Long managerId;
        private String managerName;

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

        public UserResponse build() {
            return new UserResponse(id, username, fullName, email, role, managerId, managerName);
        }
    }
}
