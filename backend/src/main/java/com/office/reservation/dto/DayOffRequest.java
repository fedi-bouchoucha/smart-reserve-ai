package com.office.reservation.dto;

import java.time.LocalDate;
import java.util.List;

public class DayOffRequest {
    private List<LocalDate> dates;

    public DayOffRequest() {}

    public DayOffRequest(List<LocalDate> dates) {
        this.dates = dates;
    }

    public List<LocalDate> getDates() { return dates; }
    public void setDates(List<LocalDate> dates) { this.dates = dates; }
}
