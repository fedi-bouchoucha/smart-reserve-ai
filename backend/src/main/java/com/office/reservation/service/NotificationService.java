package com.office.reservation.service;

import com.office.reservation.entity.Notification;
import com.office.reservation.entity.User;
import com.office.reservation.repository.NotificationRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    public NotificationService(JavaMailSender mailSender, 
                               SimpMessagingTemplate messagingTemplate, 
                               NotificationRepository notificationRepository) {
        this.mailSender = mailSender;
        this.messagingTemplate = messagingTemplate;
        this.notificationRepository = notificationRepository;
    }

    @Async
    @Transactional
    public void sendEmailNotification(User user, String subject, String body) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(body);
        notification.setType(Notification.NotificationType.EMAIL);

        try {
            // DEBUG: Display code in console for development
            System.out.println("==========================================================");
            System.out.println("                DEBUG EMAIL NOTIFICATION");
            System.out.println("==========================================================");
            System.out.println("To: " + user.getEmail());
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body.replaceAll("<[^>]*>", "")); // Strip HTML for console
            System.out.println("==========================================================");

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(body, true);
            
            mailSender.send(message);
            notification.setStatus(Notification.NotificationStatus.SENT);
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            // In production, we'd log this properly or use a retry queue
            System.err.println("Email delivery failed (likely SMTP config). Check console debug above for the code.");
        }
        
        notificationRepository.save(notification);
    }

    @Async
    @Transactional
    public void sendPushNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(Notification.NotificationType.PUSH);

        try {
            // Push via WebSocket to user-specific topic
            messagingTemplate.convertAndSendToUser(
                    user.getUsername(), 
                    "/topic/notifications", 
                    Map.of("message", message, "timestamp", notification.getTimestamp())
            );
            notification.setStatus(Notification.NotificationStatus.SENT);
        } catch (Exception e) {
            notification.setStatus(Notification.NotificationStatus.FAILED);
            System.err.println("Failed to send push notification: " + e.getMessage());
        }
        
        notificationRepository.save(notification);
    }
}
