package com.office.reservation.service.scoring;

import com.office.reservation.dto.RecommendationRequest;
import com.office.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Component;

@Component
public class PopularityFactor extends BaseScoringFactor {
    private final ReservationRepository reservationRepository;

    public PopularityFactor(ReservationRepository reservationRepository) {
        super("popularity", 10);
        this.reservationRepository = reservationRepository;
    }

    @Override
    public ScoringResult calculate(RecommendationRequest.RealTimeAvailability resource, RecommendationRequest context) {
        // Simple popularity heuristic: total confirmed reservations for this resource
        // In a real production app, we might use a cache or a specific analytical table
        try {
            long count = 0;
            if (resource.getId() != null) {
                // We'll simulate a popularity score between 0 and 100
                // For demonstration, let's say 10+ bookings is 100% popular
                // This is a placeholder for a more complex analytical query
                count = 5; // Placeholder
            }
            int score = (int) Math.min(count * 10, 100);
            return new ScoringResult(score, score > 50 ? "This is a popular choice" : null);
        } catch (Exception e) {
            return new ScoringResult(0, null);
        }
    }
}
