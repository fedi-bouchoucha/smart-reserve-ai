package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class TeamProximityFactor extends BaseScoringFactor {
    public TeamProximityFactor() {
        super("teamProximity", 40);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        if (Boolean.TRUE.equals(resource.getProximityToTeam())) {
            return new ScoringResult(100, "Near your team members");
        }
        return new ScoringResult(0, null);
    }
}
