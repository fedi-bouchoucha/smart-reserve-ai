package com.office.reservation.event;

import com.office.reservation.entity.User;
import com.office.reservation.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private final NotificationService notificationService;

    public NotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Async
    @EventListener
    public void handleReservationStatusChanged(ReservationStatusChangedEvent event) {
        User user = event.getUser();
        String statusLabel = event.getStatus().toLowerCase();
        
        String title = "Reservation " + event.getStatus();
        String message = String.format(
            "Hello %s,<br><br>" +
            "Your reservation (ID: %d) for <b>%s</b> on <b>%s</b> has been <b>%s</b>.<br>" +
            "%s" +
            "<br>Best regards,<br>Smart Office Team",
            user.getFullName(),
            event.getReservationId(),
            event.getResourceInfo(),
            event.getDate().toString(),
            statusLabel,
            event.getManagerComment() != null ? "<br>Manager Comment: " + event.getManagerComment() : ""
        );

        // Send Email
        notificationService.sendEmailNotification(user, title, message);
        
        // Send Push
        notificationService.sendPushNotification(user, "Your reservation for " + event.getResourceInfo() + " on " + event.getDate() + " was " + statusLabel + ".");
    }
}
