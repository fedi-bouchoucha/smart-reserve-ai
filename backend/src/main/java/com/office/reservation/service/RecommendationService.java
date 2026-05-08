package com.office.reservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.office.reservation.dto.RecommendationRequest;
import com.office.reservation.dto.RecommendationResponse;
import com.office.reservation.dto.RecommendationResponse.RecommendationItem;
import com.office.reservation.entity.Reservation;
import com.office.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.office.reservation.service.scoring.ScoringFactor;
import com.office.reservation.service.scoring.ScoringResult;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final List<ScoringFactor> scoringFactors;

    @Value("${app.llm.api-url}")
    private String apiUrl;

    @Value("${app.llm.api-key}")
    private String apiKey;

    @Value("${app.llm.model}")
    private String modelName;

    public RecommendationService(ReservationRepository reservationRepository, List<ScoringFactor> scoringFactors) {
        this.reservationRepository = reservationRepository;
        this.scoringFactors = scoringFactors;
        
        // Configure RestTemplate with timeouts to prevent hanging
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
        
        this.objectMapper = new ObjectMapper()
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    // Existing simple method for backwards compatibility
    public Map<String, Object> getRecommendations(Long userId) {
        List<Reservation> userReservations = reservationRepository.findByUserId(userId);
        
        if (userReservations.isEmpty()) {
            return Map.of("message", "Welcome! Try booking a meeting room for your next collaboration.");
        }

        String favoriteRoom = userReservations.stream()
                .filter(r -> r.getMeetingRoom() != null)
                .collect(Collectors.groupingBy(r -> r.getMeetingRoom().getName(), Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Meeting Room A");

        return Map.of(
            "message", "Based on your routine, you usually prefer " + favoriteRoom + ".",
            "bestRooms", Collections.singletonList(Map.of("id", 1, "name", "Meeting Room A"))
        );
    }

    // New LLM-powered Recommendation Method with Native Fallback
    @Cacheable(value = "recommendations", key = "#request.userId + '-' + (#request.currentRequest != null ? #request.currentRequest.date : 'no-date')")
    public RecommendationResponse generateRecommendations(RecommendationRequest request) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_API_KEY_HERE")) {
            System.out.println("LLM API Key not configured. Falling back to native Java heuristic engine.");
            return generateNativeRecommendations(request);
        }

        try {
            System.out.println("Generating AI recommendations for user: " + request.getUserId());
            // 1. Serialize the input request
            String requestJson = objectMapper.writeValueAsString(request);

            // 2. Construct the Prompt (system prompt)
            String systemPrompt = "You are an intelligent recommendation AI for a smart office reservation system.\n" +
                    "Your goal is to suggest the best desk or meeting room for a user based on their preferences, behavior, and context.\n\n" +
                    "INPUT DATA:\n" + requestJson + "\n\n" +
                    "YOUR TASK:\n" +
                    "1. Analyze all inputs and rank the best options.\n" +
                    "2. Recommend the top 3 most suitable desks or rooms.\n" +
                    "3. Assign a relevance score (0–100) to each recommendation.\n" +
                    "4. Assign a confidence score (0.0–1.0).\n" +
                    "5. Provide a detailed score breakdown for each factor.\n" +
                    "6. List clear reasons for the recommendation.\n\n" +
                    "OUTPUT FORMAT (JSON ONLY):\n" +
                    "{\n" +
                    "  \"recommendations\": [\n" +
                    "    {\n" +
                    "      \"resourceId\": \"string\",\n" +
                    "      \"type\": \"desk or meeting_room\",\n" +
                    "      \"score\": number,\n" +
                    "      \"confidence\": number,\n" +
                    "      \"reason\": \"Summary explanation\",\n" +
                    "      \"reasons\": [\"Factor explanation 1\", \"Factor explanation 2\"],\n" +
                    "      \"scoreBreakdown\": {\"teamProximity\": 40, \"preferences\": 30, \"history\": 22}\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";

            // 3. Build the external API request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", modelName,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt)
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // 4. Call the LLM API
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            String responseBody = response.getBody();

            if (responseBody == null || responseBody.isEmpty()) {
                throw new RuntimeException("LLM API returned an empty response body.");
            }

            // 5. Parse the Response
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            
            if (!choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException("LLM API response has no choices or invalid format: " + responseBody);
            }

            String content = choices.get(0).path("message").path("content").asText();

            if (content == null || content.isEmpty()) {
                throw new RuntimeException("LLM API returned empty message content.");
            }

            // Deserialize the content back into RecommendationResponse
            RecommendationResponse result = objectMapper.readValue(content, RecommendationResponse.class);
            System.out.println("AI recommendations successfully generated for user: " + request.getUserId());
            return result;

        } catch (Exception e) {
            System.err.println("LLM AI engine failed for user " + request.getUserId() + ": " + e.getMessage());
            System.out.println("Transitioning to high-performance native heuristic fallback...");
            try {
                return generateNativeRecommendations(request);
            } catch (Exception nativeEx) {
                System.err.println("CRITICAL: Native heuristic engine also failed: " + nativeEx.getMessage());
                // Return an empty response instead of crashing to keep the UI alive
                return new RecommendationResponse(new java.util.ArrayList<>());
            }
        }
    }

    private RecommendationResponse generateNativeRecommendations(RecommendationRequest request) {
        List<RecommendationItem> scoredItems = new java.util.ArrayList<>();

        if (request.getRealTimeAvailability() == null || request.getRealTimeAvailability().isEmpty()) {
            // Return a default welcome recommendation if no desks are provided
            scoredItems.add(RecommendationItem.builder()
                .resourceId("System")
                .type("Info")
                .score(100)
                .reason("Welcome! Please select a date to see available desks.")
                .reasons(List.of("Waiting for availability data"))
                .build());
            return new RecommendationResponse(scoredItems);
        }

        String reqType = request.getCurrentRequest() != null && request.getCurrentRequest().getType() != null 
                ? request.getCurrentRequest().getType() : "desk";
        int reqCapacity = (request.getCurrentRequest() != null && request.getCurrentRequest().getNumberOfPeople() != null)
                ? request.getCurrentRequest().getNumberOfPeople() : 1;

        for (RecommendationRequest.RealTimeAvailability resource : request.getRealTimeAvailability()) {
            Map<String, Integer> breakdown = new java.util.HashMap<>();
            List<String> reasons = new java.util.ArrayList<>();
            
            double totalWeightedScore = 0;
            int totalWeight = 0;
            int factorsWithPositiveScore = 0;

            for (ScoringFactor factor : scoringFactors) {
                ScoringResult result = factor.calculate(resource, request);
                int contribution = (result.score() * factor.getWeight()) / 100;
                
                breakdown.put(factor.getName(), contribution);
                if (result.score() > 0) {
                    totalWeightedScore += contribution;
                    factorsWithPositiveScore++;
                    if (result.reason() != null) {
                        reasons.add(result.reason());
                    }
                }
                totalWeight += factor.getWeight();
            }

            // 1. Capacity check for meeting rooms (Hard Constraint - overrides score if failed)
            if ("meeting_room".equalsIgnoreCase(reqType)) {
                if (resource.getCapacity() != null && resource.getCapacity() < reqCapacity) {
                    continue; 
                }
            }

            int finalScore = (int) Math.min(totalWeightedScore, 100);
            double confidence = (factorsWithPositiveScore > 0) ? (0.7 + (0.3 * (factorsWithPositiveScore / (double) scoringFactors.size()))) : 0.5;

            // Base fallback reason if nothing matched
            if (reasons.isEmpty()) {
                finalScore = 5;
                reasons.add("Available resource");
            }

            scoredItems.add(RecommendationItem.builder()
                    .resourceId(resource.getId())
                    .type(reqType)
                    .score(finalScore)
                    .confidence(confidence)
                    .reason(reasons.isEmpty() ? "Good match" : reasons.get(0))
                    .reasons(reasons)
                    .scoreBreakdown(breakdown)
                    .build());
        }

        // Sort descending by score
        scoredItems.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        // Return top 3
        List<RecommendationItem> top3 = scoredItems.size() > 3 ? scoredItems.subList(0, 3) : scoredItems;

        return new RecommendationResponse(top3);
    }
}
