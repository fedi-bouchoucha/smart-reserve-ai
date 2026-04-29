package com.office.reservation.service;

import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }



    public Map<String, Object> getOverview() {
        long totalReservations = reservationRepository.count();

        if (totalReservations == 0) {
            Map<String, Object> mock = new HashMap<>();
            mock.put("totalReservations", 124L);
            mock.put("utilizationRate", 68L);
            mock.put("mostBookedRoom", "Meeting Room A");
            return mock;
        }

        long utilization = (totalReservations * 100) / 320;

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalReservations", totalReservations);
        overview.put("utilizationRate", utilization);
        overview.put("mostBookedRoom", "Meeting Room A");
        return overview;
    }

    public List<Map<String, Object>> getUsageTrends() {
        if (reservationRepository.count() == 0) {
            return generateMockTrends();
        }

        return reservationRepository.findAll().stream()
                .collect(Collectors.groupingBy(Reservation::getDate, Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("count", e.getValue());
                    return map;
                })
                .sorted((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getDailyPresencePercentage() {
        long totalUsers = userRepository.count();
        if (totalUsers == 0) totalUsers = 1; // prevent division by zero

        if (reservationRepository.count() == 0) {
            return generateMockPresence();
        }

        final long denomenator = totalUsers; // for use in lambda

        return reservationRepository.findAll().stream()
                .collect(Collectors.groupingBy(Reservation::getDate, Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    long count = e.getValue();
                    double percentage = (double) count * 100 / denomenator;
                    
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", e.getKey().toString());
                    map.put("percentage", Math.round(percentage));
                    return map;
                })
                .sorted((a, b) -> ((String) a.get("date")).compareTo((String) b.get("date")))
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> generateMockTrends() {
        List<Map<String, Object>> mock = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", today.minusDays(i).toString());
            map.put("count", 15 + (int) (Math.random() * 20));
            mock.add(map);
        }
        return mock;
    }

    private List<Map<String, Object>> generateMockPresence() {
        List<Map<String, Object>> mock = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", today.minusDays(i).toString());
            map.put("percentage", 40 + (int) (Math.random() * 50));
            mock.add(map);
        }
        return mock;
    }
}
