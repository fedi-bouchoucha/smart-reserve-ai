package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class NoiseLevelFactor extends BaseScoringFactor {
    public NoiseLevelFactor() {
        super("noiseLevel", 15);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        if (context.getUserPreferences() != null && context.getUserPreferences().getPreferredNoiseLevel() != null 
            && resource.getNoiseLevel() != null) {
            if (context.getUserPreferences().getPreferredNoiseLevel().equalsIgnoreCase(resource.getNoiseLevel())) {
                return new ScoringResult(100, "Matches your preferred noise level (" + resource.getNoiseLevel() + ")");
            }
        }
        return new ScoringResult(0, null);
    }
}
