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
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.llm.api-url}")
    private String apiUrl;

    @Value("${app.llm.api-key}")
    private String apiKey;

    @Value("${app.llm.model}")
    private String modelName;

    public RecommendationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
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
    public RecommendationResponse generateRecommendations(RecommendationRequest request) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_API_KEY_HERE")) {
            System.out.println("LLM API Key not configured. Falling back to native Java heuristic engine.");
            return generateNativeRecommendations(request);
        }

        try {
            // 1. Serialize the input request
            String requestJson = objectMapper.writeValueAsString(request);

            // 2. Construct the Prompt
            String systemPrompt = "You are an intelligent recommendation AI for a smart office reservation system.\n" +
                    "Your goal is to suggest the best desk or meeting room for a user based on their preferences, behavior, and context.\n\n" +
                    "INPUT DATA:\n" + requestJson + "\n\n" +
                    "YOUR TASK:\n" +
                    "1. Analyze all inputs and rank the best options.\n" +
                    "2. Recommend the top 3 most suitable desks or rooms.\n" +
                    "3. Assign a relevance score (0–100) to each recommendation.\n" +
                    "4. Explain briefly why each option is recommended.\n\n" +
                    "DECISION FACTORS:\n" +
                    "- Match with user preferences\n" +
                    "- Similarity to past behavior\n" +
                    "- Proximity to team members\n" +
                    "- Fit with requested time and capacity\n" +
                    "- Resource optimization (avoid overcrowding)\n\n" +
                    "OUTPUT FORMAT (JSON ONLY):\n" +
                    "{\n" +
                    "  \"recommendations\": [\n" +
                    "    {\n" +
                    "      \"resourceId\": \"string\",\n" +
                    "      \"type\": \"desk or meeting_room\",\n" +
                    "      \"score\": number,\n" +
                    "      \"reason\": \"short explanation\"\n" +
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

            // 5. Parse the Response
            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Deserialize the content back into RecommendationResponse
            return objectMapper.readValue(content, RecommendationResponse.class);

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("LLM API request failed. Falling back to native Java heuristic engine.");
            return generateNativeRecommendations(request);
        }
    }

    private RecommendationResponse generateNativeRecommendations(RecommendationRequest request) {
        List<RecommendationItem> scoredItems = new java.util.ArrayList<>();

        if (request.getRealTimeAvailability() == null || request.getRealTimeAvailability().isEmpty()) {
            return new RecommendationResponse(scoredItems);
        }

        String reqType = request.getCurrentRequest() != null && request.getCurrentRequest().getType() != null 
                ? request.getCurrentRequest().getType() : "desk";
        int reqCapacity = (request.getCurrentRequest() != null && request.getCurrentRequest().getNumberOfPeople() != null)
                ? request.getCurrentRequest().getNumberOfPeople() : 1;

        for (RecommendationRequest.RealTimeAvailability resource : request.getRealTimeAvailability()) {
            int score = 0;
            List<String> reasons = new java.util.ArrayList<>();

            // 1. Capacity check for meeting rooms
            if ("meeting_room".equalsIgnoreCase(reqType)) {
                if (resource.getCapacity() != null && resource.getCapacity() < reqCapacity) {
                    continue; // Skip if it cannot fit the team
                }
                if (resource.getCapacity() != null && resource.getCapacity() >= reqCapacity) {
                    // Resource optimization: avoid booking a 20-person room for 2 people
                    if (resource.getCapacity() <= reqCapacity + 2) {
                        score += 15;
                        reasons.add("Perfect capacity fit");
                    } else {
                        score += 5; // Fits, but too large
                        reasons.add("Sufficient capacity (oversized)");
                    }
                }
            }

            // 2. Preferences Match
            if (request.getUserPreferences() != null) {
                // Preferred Zone
                if (request.getUserPreferences().getPreferredZone() != null 
                        && request.getUserPreferences().getPreferredZone().equalsIgnoreCase(resource.getZone())) {
                    score += 25;
                    reasons.add("Matches preferred zone (" + resource.getZone() + ")");
                }

                // Preferred Floor
                if (request.getUserPreferences().getPreferredFloor() != null 
                        && request.getUserPreferences().getPreferredFloor().equalsIgnoreCase(resource.getFloor())) {
                    score += 15;
                    reasons.add("On preferred floor (" + resource.getFloor() + ")");
                }

                // Equipment Needs
                if (request.getUserPreferences().getEquipmentNeeds() != null 
                        && resource.getEquipment() != null) {
                    long matchedEquip = request.getUserPreferences().getEquipmentNeeds().stream()
                            .filter(eq -> resource.getEquipment().contains(eq))
                            .count();
                    if (matchedEquip > 0) {
                        score += (matchedEquip * 10);
                        reasons.add("Has requested equipment");
                    }
                }
            }

            // 3. Proximity to team
            if (Boolean.TRUE.equals(resource.getProximityToTeam())) {
                score += 20;
                reasons.add("Close to team members");
            }

            // 4. Historical Behavior
            if (request.getHistoricalBehavior() != null) {
                if ("desk".equalsIgnoreCase(reqType) && request.getHistoricalBehavior().getFrequentlyBookedDesks() != null) {
                    if (request.getHistoricalBehavior().getFrequentlyBookedDesks().contains(resource.getId())) {
                        score += 10;
                        reasons.add("Frequently booked in the past");
                        // Introduce diversity by slightly capping score for overused desks
                        score -= 5;
                    }
                } else if ("meeting_room".equalsIgnoreCase(reqType) && request.getHistoricalBehavior().getFrequentlyUsedRooms() != null) {
                    if (request.getHistoricalBehavior().getFrequentlyUsedRooms().contains(resource.getId())) {
                        score += 10;
                        reasons.add("Frequently used room");
                    }
                }
            }

            // Base fallback reason if nothing matched
            if (reasons.isEmpty()) {
                score += 5; // Base score just for being available
                reasons.add("Available resource");
            }

            score = Math.min(score, 100);

            scoredItems.add(RecommendationItem.builder()
                    .resourceId(resource.getId())
                    .type(reqType)
                    .score(score)
                    .reason(String.join(" | ", reasons))
                    .build());
        }

        // Sort descending by score
        scoredItems.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        // Return top 3
        List<RecommendationItem> top3 = scoredItems.size() > 3 ? scoredItems.subList(0, 3) : scoredItems;

        return new RecommendationResponse(top3);
    }
}
