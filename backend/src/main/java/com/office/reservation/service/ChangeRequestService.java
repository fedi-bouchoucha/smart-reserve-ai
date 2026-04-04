package com.office.reservation.service;

import com.office.reservation.dto.ChangeRequestDTO;
import com.office.reservation.entity.*;
import com.office.reservation.event.ReservationStatusChangedEvent;
import com.office.reservation.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ReservationRepository reservationRepository;
    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ChangeRequestService(ChangeRequestRepository changeRequestRepository,
            ReservationRepository reservationRepository,
            ChairRepository chairRepository,
            MeetingRoomRepository meetingRoomRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher) {
        this.changeRequestRepository = changeRequestRepository;
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Map<String, Object> createChangeRequest(Long userId, ChangeRequestDTO dto) {
        // Rule 7: Modification not allowed on day 28
        if (LocalDate.now().getDayOfMonth() == 28) {
            throw new RuntimeException("Reservation modifications are not allowed on the 28th");
        }

        Reservation reservation = reservationRepository.findById(dto.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (!reservation.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only modify your own reservations");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChangeRequest cr = new ChangeRequest();
        cr.setReservation(reservation);
        cr.setRequestedBy(user);
        cr.setNewDate(dto.getNewDate());
        cr.setStatus(ChangeRequestStatus.PENDING);

        if (dto.getNewChairId() != null) {
            Chair chair = chairRepository.findById(dto.getNewChairId())
                    .orElseThrow(() -> new RuntimeException("Chair not found"));
            cr.setNewChair(chair);
        }
        if (dto.getNewMeetingRoomId() != null) {
            MeetingRoom room = meetingRoomRepository.findById(dto.getNewMeetingRoomId())
                    .orElseThrow(() -> new RuntimeException("Meeting room not found"));
            cr.setNewMeetingRoom(room);
        }

        ChangeRequest saved = changeRequestRepository.save(cr);
        return mapToResponse(saved);
    }

    public List<Map<String, Object>> getPendingRequestsForManager(Long managerId) {
        return changeRequestRepository.findByManagerIdAndStatus(managerId, ChangeRequestStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMyChangeRequests(Long userId) {
        return changeRequestRepository.findByRequestedById(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> approveRequest(Long requestId, String comment) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Change request not found"));

        cr.setStatus(ChangeRequestStatus.APPROVED);
        cr.setManagerComment(comment);

        // Apply changes to the reservation
        Reservation reservation = cr.getReservation();
        if (cr.getNewDate() != null) {
            reservation.setDate(cr.getNewDate());
        }
        if (cr.getNewChair() != null) {
            reservation.setChair(cr.getNewChair());
            reservation.setMeetingRoom(null);
        }
        if (cr.getNewMeetingRoom() != null) {
            reservation.setMeetingRoom(cr.getNewMeetingRoom());
            reservation.setChair(null);
        }
        reservationRepository.save(reservation);
        ChangeRequest saved = changeRequestRepository.save(cr);

        // Notify user
        eventPublisher.publishEvent(new ReservationStatusChangedEvent(
            this, 
            cr.getRequestedBy(), 
            reservation.getId(), 
            reservation.getChair() != null ? "Chair " + reservation.getChair().getNumber() : "Room " + reservation.getMeetingRoom().getName(), 
            reservation.getDate(), 
            "APPROVED", 
            comment
        ));

        return mapToResponse(saved);
    }

    @Transactional
    public Map<String, Object> rejectRequest(Long requestId, String comment) {
        ChangeRequest cr = changeRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Change request not found"));
        cr.setStatus(ChangeRequestStatus.REJECTED);
        cr.setManagerComment(comment);
        ChangeRequest saved = changeRequestRepository.save(cr);

        // Notify user
        eventPublisher.publishEvent(new ReservationStatusChangedEvent(
            this, 
            cr.getRequestedBy(), 
            cr.getReservation().getId(), 
            cr.getReservation().getChair() != null ? "Chair " + cr.getReservation().getChair().getNumber() : "Room " + cr.getReservation().getMeetingRoom().getName(), 
            cr.getReservation().getDate(), 
            "REJECTED", 
            comment
        ));

        return mapToResponse(saved);
    }

    public List<Map<String, Object>> getAllChangeRequests() {
        return changeRequestRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private Map<String, Object> mapToResponse(ChangeRequest cr) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", cr.getId());
        map.put("reservationId", cr.getReservation().getId());
        map.put("reservationDate", cr.getReservation().getDate());
        map.put("requestedBy", cr.getRequestedBy().getFullName());
        map.put("requestedById", cr.getRequestedBy().getId());
        map.put("newDate", cr.getNewDate());
        map.put("newChairId", cr.getNewChair() != null ? cr.getNewChair().getId() : null);
        map.put("newMeetingRoomId", cr.getNewMeetingRoom() != null ? cr.getNewMeetingRoom().getId() : null);
        map.put("status", cr.getStatus().name());
        map.put("managerComment", cr.getManagerComment());
        map.put("createdAt", cr.getCreatedAt());
        return map;
    }
}
