package com.office.reservation.dto;

import java.util.List;

public class RecommendationResponse {

    private List<RecommendationItem> recommendations;

    public RecommendationResponse() {}

    public RecommendationResponse(List<RecommendationItem> recommendations) {
        this.recommendations = recommendations;
    }

    public List<RecommendationItem> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationItem> recommendations) {
        this.recommendations = recommendations;
    }

    public static class RecommendationItem {
        private String resourceId;
        private String type;
        private int score;
        private String reason;
        private Double confidence;
        private java.util.List<String> reasons;
        private java.util.Map<String, Integer> scoreBreakdown;

        public RecommendationItem() {}

        public RecommendationItem(String resourceId, String type, int score, String reason, Double confidence, java.util.List<String> reasons, java.util.Map<String, Integer> scoreBreakdown) {
            this.resourceId = resourceId;
            this.type = type;
            this.score = score;
            this.reason = reason;
            this.confidence = confidence;
            this.reasons = reasons;
            this.scoreBreakdown = scoreBreakdown;
        }

        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }

        public java.util.List<String> getReasons() { return reasons; }
        public void setReasons(java.util.List<String> reasons) { this.reasons = reasons; }

        public java.util.Map<String, Integer> getScoreBreakdown() { return scoreBreakdown; }
        public void setScoreBreakdown(java.util.Map<String, Integer> scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

        public static RecommendationItemBuilder builder() {
            return new RecommendationItemBuilder();
        }

        public static class RecommendationItemBuilder {
            private String resourceId;
            private String type;
            private int score;
            private String reason;
            private Double confidence;
            private java.util.List<String> reasons;
            private java.util.Map<String, Integer> scoreBreakdown;

            public RecommendationItemBuilder resourceId(String resourceId) {
                this.resourceId = resourceId;
                return this;
            }

            public RecommendationItemBuilder type(String type) {
                this.type = type;
                return this;
            }

            public RecommendationItemBuilder score(int score) {
                this.score = score;
                return this;
            }

            public RecommendationItemBuilder reason(String reason) {
                this.reason = reason;
                return this;
            }

            public RecommendationItemBuilder confidence(Double confidence) {
                this.confidence = confidence;
                return this;
            }

            public RecommendationItemBuilder reasons(java.util.List<String> reasons) {
                this.reasons = reasons;
                return this;
            }

            public RecommendationItemBuilder scoreBreakdown(java.util.Map<String, Integer> scoreBreakdown) {
                this.scoreBreakdown = scoreBreakdown;
                return this;
            }

            public RecommendationItem build() {
                return new RecommendationItem(resourceId, type, score, reason, confidence, reasons, scoreBreakdown);
            }
        }
    }
}
