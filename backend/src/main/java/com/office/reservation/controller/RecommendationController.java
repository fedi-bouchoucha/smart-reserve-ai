package com.office.reservation.controller;

import com.office.reservation.dto.RecommendationRequest;
import com.office.reservation.dto.RecommendationResponse;
import com.office.reservation.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<RecommendationResponse> generateRecommendations(@RequestBody RecommendationRequest request) {
        RecommendationResponse response = recommendationService.generateRecommendations(request);
        return ResponseEntity.ok(response);
    }
}
