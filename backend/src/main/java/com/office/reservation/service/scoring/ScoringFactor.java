package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;

public interface ScoringFactor {
    ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context);
    String getName();
    int getWeight();
}
