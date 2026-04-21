package com.office.reservation.service;

import com.office.reservation.dto.SmartSchedulingDTO;
import com.office.reservation.repository.ChairRepository;
import com.office.reservation.repository.MeetingRoomRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.office.reservation.entity.ReservationStatus;

@Component
public class ConflictResolver {

    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;

    public ConflictResolver(ChairRepository chairRepository, MeetingRoomRepository meetingRoomRepository) {
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
    }

    public List<SmartSchedulingDTO> proposeAlternatives(LocalDate date, LocalTime start, LocalTime end) {
        List<SmartSchedulingDTO> alternatives = new ArrayList<>();

        // Strategy 1: Find available chairs at same time
        chairRepository.findAvailableChairs(date, start, end, Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_APPROVAL, ReservationStatus.AUTO_ASSIGNED)).stream()
                .limit(2)
                .forEach(c -> alternatives.add(SmartSchedulingDTO.builder()
                        .type("RESOURCE_SWAP")
                        .chairId(c.getId())
                        .startTime(start)
                        .endTime(end)
                        .reasoning("Chair " + c.getNumber() + " is available at your requested time.")
                        .build()));

        // Strategy 2: Alternative times (e.g., 2 hours later)
        alternatives.add(SmartSchedulingDTO.builder()
                .type("TIME_ADJUSTMENT")
                .startTime(start.plusHours(2))
                .endTime(end.plusHours(2))
                .reasoning("The office is less busy 2 hours later.")
                .build());

        return alternatives;
    }
}
