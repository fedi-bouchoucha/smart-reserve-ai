package com.office.reservation.controller;

import com.office.reservation.service.AnalyticsService;
import com.office.reservation.service.ReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;
    private final ReportService reportService;

    public AdminAnalyticsController(AnalyticsService analyticsService, ReportService reportService) {
        this.analyticsService = analyticsService;
        this.reportService = reportService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/usage-trends")
    public ResponseEntity<List<Map<String, Object>>> getUsageTrends() {
        return ResponseEntity.ok(analyticsService.getUsageTrends());
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<Map<String, Object>>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakHours());
    }

    @GetMapping("/download-report")
    public ResponseEntity<InputStreamResource> downloadReport() {
        ByteArrayInputStream bis = reportService.generateOfficeUsageReport();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=office_usage_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
