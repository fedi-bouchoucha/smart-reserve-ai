package com.office.reservation.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chairs")
public class Chair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer number;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emplacement_id", nullable = false)
    private Emplacement emplacement;

    @ElementCollection
    @CollectionTable(name = "chair_equipment", joinColumns = @JoinColumn(name = "chair_id"))
    @Column(name = "equipment")
    private java.util.List<String> equipment;

    private String noiseLevel;

    public Chair() {
    }

    public Chair(Long id, Integer number, Emplacement emplacement, java.util.List<String> equipment, String noiseLevel) {
        this.id = id;
        this.number = number;
        this.emplacement = emplacement;
        this.equipment = equipment;
        this.noiseLevel = noiseLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getNumber() {
        return number;
    }

    public void setNumber(Integer number) {
        this.number = number;
    }

    public Emplacement getEmplacement() {
        return emplacement;
    }

    public void setEmplacement(Emplacement emplacement) {
        this.emplacement = emplacement;
    }

    public java.util.List<String> getEquipment() {
        return equipment;
    }

    public void setEquipment(java.util.List<String> equipment) {
        this.equipment = equipment;
    }

    public String getNoiseLevel() {
        return noiseLevel;
    }

    public void setNoiseLevel(String noiseLevel) {
        this.noiseLevel = noiseLevel;
    }

    public static ChairBuilder builder() {
        return new ChairBuilder();
    }

    public static class ChairBuilder {
        private Long id;
        private Integer number;
        private Emplacement emplacement;
        private java.util.List<String> equipment;
        private String noiseLevel;

        public ChairBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ChairBuilder number(Integer number) {
            this.number = number;
            return this;
        }

        public ChairBuilder emplacement(Emplacement emplacement) {
            this.emplacement = emplacement;
            return this;
        }

        public ChairBuilder equipment(java.util.List<String> equipment) {
            this.equipment = equipment;
            return this;
        }

        public ChairBuilder noiseLevel(String noiseLevel) {
            this.noiseLevel = noiseLevel;
            return this;
        }

        public Chair build() {
            return new Chair(id, number, emplacement, equipment, noiseLevel);
        }
    }
}
