package com.office.reservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_snapshots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "week_start"})
})
public class PerformanceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(nullable = false)
    private double score;

    @Column(name = "booking_frequency")
    private int bookingFrequency;

    @Column(name = "cancellation_count")
    private int cancellationCount;

    @Column(name = "no_show_count")
    private int noShowCount;

    @Column(name = "change_request_count")
    private int changeRequestCount;

    @Column(name = "day_off_count")
    private int dayOffCount;

    @Column(name = "planning_score")
    private double planningScore;

    @Column(name = "engagement_score")
    private double engagementScore;

    @Column(name = "computed_at")
    private LocalDateTime computedAt;

    @PrePersist
    public void prePersist() {
        this.computedAt = LocalDateTime.now();
    }

    public PerformanceSnapshot() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public int getBookingFrequency() { return bookingFrequency; }
    public void setBookingFrequency(int bookingFrequency) { this.bookingFrequency = bookingFrequency; }

    public int getCancellationCount() { return cancellationCount; }
    public void setCancellationCount(int cancellationCount) { this.cancellationCount = cancellationCount; }

    public int getNoShowCount() { return noShowCount; }
    public void setNoShowCount(int noShowCount) { this.noShowCount = noShowCount; }

    public int getChangeRequestCount() { return changeRequestCount; }
    public void setChangeRequestCount(int changeRequestCount) { this.changeRequestCount = changeRequestCount; }

    public int getDayOffCount() { return dayOffCount; }
    public void setDayOffCount(int dayOffCount) { this.dayOffCount = dayOffCount; }

    public double getPlanningScore() { return planningScore; }
    public void setPlanningScore(double planningScore) { this.planningScore = planningScore; }

    public double getEngagementScore() { return engagementScore; }
    public void setEngagementScore(double engagementScore) { this.engagementScore = engagementScore; }

    public LocalDateTime getComputedAt() { return computedAt; }
    public void setComputedAt(LocalDateTime computedAt) { this.computedAt = computedAt; }
}
