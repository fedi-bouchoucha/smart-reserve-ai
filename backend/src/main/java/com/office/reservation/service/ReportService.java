package com.office.reservation.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.office.reservation.entity.Reservation;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReportService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ReportService(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    public ByteArrayInputStream generateOfficeUsageReport() {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Paragraph header = new Paragraph("Smart Office Usage Report", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(20);
            document.add(header);

            // Statistics Section
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            document.add(new Paragraph("System Statistics Summary", subHeaderFont));
            document.add(new Paragraph("Total Registered Users: " + userRepository.count()));
            document.add(new Paragraph("Total System Reservations: " + reservationRepository.count()));
            document.add(new Paragraph(" ")); // Spacer

            // Reservations Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{3, 3, 2, 2});

            String[] headers = {"User", "Date", "Resource", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            List<Reservation> reservations = reservationRepository.findAll();
            for (Reservation r : reservations) {
                table.addCell(r.getUser().getFullName());
                table.addCell(r.getDate().toString());
                table.addCell(r.getChair() != null ? "Chair " + r.getChair().getNumber() : "Meeting Room");
                table.addCell(r.getStatus().name());
            }

            document.add(table);
            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
