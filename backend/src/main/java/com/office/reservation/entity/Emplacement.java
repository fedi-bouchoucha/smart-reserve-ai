package com.office.reservation.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "emplacements")
public class Emplacement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer floor;

    @OneToMany(mappedBy = "emplacement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Chair> chairs;

    public Emplacement() {
    }

    public Emplacement(Long id, String name, Integer floor) {
        this.id = id;
        this.name = name;
        this.floor = floor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public List<Chair> getChairs() {
        return chairs;
    }

    public void setChairs(List<Chair> chairs) {
        this.chairs = chairs;
    }

    public static EmplacementBuilder builder() {
        return new EmplacementBuilder();
    }

    public static class EmplacementBuilder {
        private Long id;
        private String name;
        private Integer floor;

        public EmplacementBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public EmplacementBuilder name(String name) {
            this.name = name;
            return this;
        }

        public EmplacementBuilder floor(Integer floor) {
            this.floor = floor;
            return this;
        }

        public Emplacement build() {
            return new Emplacement(id, name, floor);
        }
    }
}
