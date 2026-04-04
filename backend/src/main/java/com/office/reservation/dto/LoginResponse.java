package com.office.reservation.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String fullName;
    private String profilePicture;
    private String role;
    private Long userId;

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, String fullName, String profilePicture, String role, Long userId) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.profilePicture = profilePicture;
        this.role = role;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }

    public static class LoginResponseBuilder {
        private String token;
        private String username;
        private String fullName;
        private String profilePicture;
        private String role;
        private Long userId;

        public LoginResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public LoginResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public LoginResponseBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public LoginResponseBuilder profilePicture(String profilePicture) {
            this.profilePicture = profilePicture;
            return this;
        }

        public LoginResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public LoginResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public LoginResponse build() {
            return new LoginResponse(token, username, fullName, profilePicture, role, userId);
        }
    }
}
