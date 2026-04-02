package com.office.reservation.service;

import com.office.reservation.entity.Reservation;
import com.office.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ReservationRepository reservationRepository;

    public RecommendationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public Map<String, Object> getRecommendations(Long userId) {
        List<Reservation> userReservations = reservationRepository.findByUserId(userId);
        
        if (userReservations.isEmpty()) {
            return Map.of("message", "Welcome! Try booking a meeting room for your next collaboration.");
        }

        // Recommend based on most booked meeting room
        String favoriteRoom = userReservations.stream()
                .filter(r -> r.getMeetingRoom() != null)
                .collect(Collectors.groupingBy(r -> r.getMeetingRoom().getName(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Meeting Room A");

        return Map.of(
            "message", "Based on your routine, you usually prefer " + favoriteRoom + ".",
            "bestRooms", Collections.singletonList(Map.of("id", 1, "name", "Meeting Room A")) // Mock IDs
        );
    }
}
