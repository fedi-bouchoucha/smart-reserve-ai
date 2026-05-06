package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class HistoryFactor extends BaseScoringFactor {
    public HistoryFactor() {
        super("history", 20);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        if (context.getHistoricalBehavior() != null) {
            if (context.getHistoricalBehavior().getFrequentlyBookedDesks() != null 
                && context.getHistoricalBehavior().getFrequentlyBookedDesks().contains(resource.getId())) {
                return new ScoringResult(100, "You've booked this frequently before");
            }
            if (context.getHistoricalBehavior().getFrequentlyUsedRooms() != null 
                && context.getHistoricalBehavior().getFrequentlyUsedRooms().contains(resource.getId())) {
                return new ScoringResult(100, "You've used this room frequently");
            }
        }
        return new ScoringResult(0, null);
    }
}
