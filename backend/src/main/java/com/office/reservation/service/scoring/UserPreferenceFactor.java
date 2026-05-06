package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class UserPreferenceFactor extends BaseScoringFactor {
    public UserPreferenceFactor() {
        super("preferences", 30);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        int score = 0;
        java.util.List<String> matched = new java.util.ArrayList<>();
        
        if (context.getUserPreferences() != null) {
            if (context.getUserPreferences().getPreferredZone() != null 
                && context.getUserPreferences().getPreferredZone().equalsIgnoreCase(resource.getZone())) {
                score += 50;
                matched.add("Matches preferred zone (" + resource.getZone() + ")");
            }
            if (context.getUserPreferences().getPreferredFloor() != null 
                && context.getUserPreferences().getPreferredFloor().equalsIgnoreCase(resource.getFloor())) {
                score += 50;
                matched.add("On preferred floor (" + resource.getFloor() + ")");
            }
        }
        
        return new ScoringResult(score, matched.isEmpty() ? null : String.join(", ", matched));
    }
}
