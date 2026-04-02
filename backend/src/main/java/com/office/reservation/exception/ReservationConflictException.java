package com.office.reservation.exception;

import com.office.reservation.dto.SmartSchedulingDTO;
import java.util.List;

public class ReservationConflictException extends RuntimeException {
    private final List<SmartSchedulingDTO> alternatives;

    public ReservationConflictException(String message, List<SmartSchedulingDTO> alternatives) {
        super(message);
        this.alternatives = alternatives;
    }

    public List<SmartSchedulingDTO> getAlternatives() {
        return alternatives;
    }
}
