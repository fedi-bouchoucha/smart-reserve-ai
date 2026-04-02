package com.office.reservation.service;

import com.office.reservation.entity.Reservation;
import com.office.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ReservationRepository reservationRepository;

    public AnalyticsService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public Map<String, Object> getOverview() {
        long totalReservations = reservationRepository.count();
        long utilization = (totalReservations * 100) / 320;

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalReservations", totalReservations);
        overview.put("utilizationRate", utilization);
        overview.put("mostBookedRoom", "Meeting Room A");
        return overview;
    }

    public List<Map<String, Object>> getUsageTrends() {
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

    public List<Map<String, Object>> getPeakHours() {
        List<Map<String, Object>> peakHours = new ArrayList<>();
        peakHours.add(createPeakHourMap("09:00", 45));
        peakHours.add(createPeakHourMap("10:00", 60));
        peakHours.add(createPeakHourMap("11:00", 55));
        peakHours.add(createPeakHourMap("14:00", 50));
        return peakHours;
    }

    private Map<String, Object> createPeakHourMap(String hour, int bookings) {
        Map<String, Object> map = new HashMap<>();
        map.put("hour", hour);
        map.put("bookings", bookings);
        return map;
    }
}
