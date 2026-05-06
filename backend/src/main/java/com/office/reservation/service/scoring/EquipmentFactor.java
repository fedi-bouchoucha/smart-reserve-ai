package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class EquipmentFactor extends BaseScoringFactor {
    public EquipmentFactor() {
        super("equipment", 10);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        if (context.getUserPreferences() != null && context.getUserPreferences().getEquipmentNeeds() != null 
            && resource.getEquipment() != null && !context.getUserPreferences().getEquipmentNeeds().isEmpty()) {
            long matches = context.getUserPreferences().getEquipmentNeeds().stream()
                .filter(eq -> resource.getEquipment().contains(eq))
                .count();
            if (matches > 0) {
                int score = (int) ((double) matches / context.getUserPreferences().getEquipmentNeeds().size() * 100);
                return new ScoringResult(score, "Matches requested equipment");
            }
        }
        return new ScoringResult(0, null);
    }
}
