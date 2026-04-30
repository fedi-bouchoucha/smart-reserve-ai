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

        public RecommendationItem() {}

        public RecommendationItem(String resourceId, String type, int score, String reason) {
            this.resourceId = resourceId;
            this.type = type;
            this.score = score;
            this.reason = reason;
        }

        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public static RecommendationItemBuilder builder() {
            return new RecommendationItemBuilder();
        }

        public static class RecommendationItemBuilder {
            private String resourceId;
            private String type;
            private int score;
            private String reason;

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

            public RecommendationItem build() {
                return new RecommendationItem(resourceId, type, score, reason);
            }
        }
    }
}
