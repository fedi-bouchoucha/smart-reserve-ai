package com.office.reservation.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.office.reservation.entity.User;
import org.springframework.stereotype.Service;

@Service
public class FirebaseNotificationService {

    public void sendPushNotification(User recipient, String title, String body) {
        if (recipient.getFcmToken() == null || recipient.getFcmToken().isEmpty()) {
            System.out.println("No FCM token found for user: " + recipient.getUsername());
            return;
        }

        try {
            Message message = Message.builder()
                    .setToken(recipient.getFcmToken())
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK") // For mobile apps if needed
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent push notification to " + recipient.getUsername() + ": " + response);
        } catch (Exception e) {
            System.err.println("Error sending push notification to " + recipient.getUsername() + ": " + e.getMessage());
        }
    }
}
