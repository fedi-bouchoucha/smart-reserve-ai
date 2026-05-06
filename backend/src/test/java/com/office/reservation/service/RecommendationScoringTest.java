package com.office.reservation.service;

import com.office.reservation.dto.RecommendationRequest;
import com.office.reservation.dto.RecommendationResponse;
import com.office.reservation.service.scoring.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RecommendationScoringTest {

    private RecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        List<ScoringFactor> factors = Arrays.asList(
            new TeamProximityFactor(),
            new UserPreferenceFactor(),
            new HistoryFactor(),
            new EquipmentFactor(),
            new NoiseLevelFactor(),
            new DepartmentProximityFactor(),
            new PopularityFactor(null) // Repository not needed for simple test
        );
        recommendationService = new RecommendationService(null, factors);
    }

    @Test
    void testNativeRecommendationTransparency() {
        RecommendationRequest request = new RecommendationRequest();
        request.setUserId("1");
        
        RecommendationRequest.UserPreferences prefs = new RecommendationRequest.UserPreferences();
        prefs.setPreferredZone("Quiet Zone");
        prefs.setPreferredNoiseLevel("Low");
        request.setUserPreferences(prefs);

        RecommendationRequest.RealTimeAvailability resource = new RecommendationRequest.RealTimeAvailability();
        resource.setId("10");
        resource.setZone("Quiet Zone");
        resource.setNoiseLevel("Low");
        resource.setProximityToTeam(true);
        
        request.setRealTimeAvailability(Arrays.asList(resource));

        RecommendationResponse response = recommendationService.generateRecommendations(request);

        assertNotNull(response);
        assertFalse(response.getRecommendations().isEmpty());
        
        RecommendationResponse.RecommendationItem item = response.getRecommendations().get(0);
        assertEquals("10", item.getResourceId());
        assertTrue(item.getScore() > 0);
        assertNotNull(item.getConfidence());
        assertFalse(item.getReasons().isEmpty());
        assertNotNull(item.getScoreBreakdown());
        
        // Check breakdown contents
        assertTrue(item.getScoreBreakdown().containsKey("teamProximity"));
        assertTrue(item.getScoreBreakdown().containsKey("preferences"));
        assertTrue(item.getScoreBreakdown().containsKey("noiseLevel"));
        
        // Values should be positive for matches
        assertTrue(item.getScoreBreakdown().get("teamProximity") > 0);
        assertTrue(item.getScoreBreakdown().get("preferences") > 0);
        assertTrue(item.getScoreBreakdown().get("noiseLevel") > 0);
    }
}
