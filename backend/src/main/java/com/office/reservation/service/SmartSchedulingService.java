package com.office.reservation.service;

import com.office.reservation.dto.SmartSchedulingDTO;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SmartSchedulingService {

    private final ReservationRepository reservationRepository;

    public SmartSchedulingService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    public List<SmartSchedulingDTO> suggestSlots(Long userId, LocalDate date, int durationMinutes) {
        List<SmartSchedulingDTO> candidates = new ArrayList<>();
        
        candidates.add(evaluateSlot(date, LocalTime.of(9, 0), durationMinutes, "Standard start time"));
        candidates.add(evaluateSlot(date, LocalTime.of(10, 30), durationMinutes, "Quiet late morning"));
        candidates.add(evaluateSlot(date, LocalTime.of(14, 0), durationMinutes, "Productive afternoon"));

        return candidates.stream()
                .sorted(Comparator.comparingDouble(SmartSchedulingDTO::getScore).reversed())
                .limit(3)
                .collect(java.util.stream.Collectors.toList());
    }

    private SmartSchedulingDTO evaluateSlot(LocalDate date, LocalTime start, int duration, String reasoning) {
        LocalTime end = start.plusMinutes(duration);
        long occupancy = reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
        
        double score = 100.0;
        score -= (occupancy * 2.0);
        
        if (start.isAfter(LocalTime.of(8, 59)) && end.isBefore(LocalTime.of(17, 1))) {
            score += 10;
        }

        return SmartSchedulingDTO.builder()
                .startTime(start)
                .endTime(end)
                .score(score)
                .reasoning(reasoning)
                .build();
    }
}
