package com.office.reservation.dto;

public class UserCreateRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String role;
    private Long managerId;
    private Integer targetAttendance;

    public UserCreateRequest() {
    }

    public UserCreateRequest(String username, String password, String fullName, String email, String role,
            Long managerId, Integer targetAttendance) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.managerId = managerId;
        this.targetAttendance = targetAttendance;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Integer getTargetAttendance() {
        return targetAttendance;
    }

    public void setTargetAttendance(Integer targetAttendance) {
        this.targetAttendance = targetAttendance;
    }
}
