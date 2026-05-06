package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class DepartmentProximityFactor extends BaseScoringFactor {
    public DepartmentProximityFactor() {
        super("departmentProximity", 25);
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        if (Boolean.TRUE.equals(resource.getProximityToDepartment())) {
            return new ScoringResult(100, "Close to your department's area");
        }
        return new ScoringResult(0, null);
    }
}
