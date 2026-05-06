package com.office.reservation.service.scoring;

public abstract class BaseScoringFactor implements ScoringFactor {
    private final String name;
    private final int weight;

    protected BaseScoringFactor(String name, int weight) {
        this.name = name;
        this.weight = weight;
    }

    @Override
    public String getName() { return name; }

    @Override
    public int getWeight() { return weight; }
}
