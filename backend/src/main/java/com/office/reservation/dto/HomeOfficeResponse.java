package com.office.reservation.dto;

import com.office.reservation.entity.HomeOffice;
import java.time.LocalDate;

public class HomeOfficeResponse {
    private Long id;
    private LocalDate date;

    public HomeOfficeResponse() {}

    public HomeOfficeResponse(HomeOffice homeOffice) {
        this.id = homeOffice.getId();
        this.date = homeOffice.getDate();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
