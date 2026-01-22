package com.healthcare.scheduler.service;

import com.healthcare.scheduler.model.Appointment;
import com.healthcare.scheduler.model.Client;
import com.healthcare.scheduler.repository.AppointmentRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.format.DateTimeFormatter;

@Service
public class TwilioVoiceService {

    private static final Logger logger = LoggerFactory.getLogger(TwilioVoiceService.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String twilioPhoneNumber;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostConstruct
    public void init() {
        try {
            Twilio.init(accountSid, authToken);
            logger.info("Twilio initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Twilio: {}", e.getMessage());
        }
    }

    public void sendVoiceNotification(Appointment appointment) {
        try {
            Client client = appointment.getClient();
            String careWorkerName = appointment.getCareWorker().getFirstName() + " " + 
                                   appointment.getCareWorker().getLastName();
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' h:mm a");
            String formattedTime = appointment.getScheduledTime().format(formatter);

            String message = String.format(
                "Hello %s %s. This is a reminder that your healthcare worker, %s, " +
                "is scheduled to visit you on %s. The visit is expected to last approximately %d minutes. " +
                "If you need to reschedule, please contact your healthcare provider. Thank you.",
                client.getFirstName(),
                client.getLastName(),
                careWorkerName,
                formattedTime,
                appointment.getDurationMinutes()
            );

            String twiml = String.format(
                "<Response><Say voice=\"alice\">%s</Say></Response>",
                message
            );

            Call call = Call.creator(
                    new PhoneNumber(client.getPhoneNumber()),
                    new PhoneNumber(twilioPhoneNumber),
                    new Twiml(twiml)
            ).create();

            logger.info("Voice call initiated successfully. Call SID: {}", call.getSid());

            appointment.setVoiceNotificationSent(true);
            appointmentRepository.save(appointment);

        } catch (Exception e) {
            logger.error("Failed to send voice notification for appointment {}: {}", 
                        appointment.getId(), e.getMessage());
            throw new RuntimeException("Failed to send voice notification", e);
        }
    }

    public void sendBulkNotifications() {
        try {
            var pendingNotifications = appointmentRepository
                    .findByStatusAndVoiceNotificationSentFalse(Appointment.AppointmentStatus.SCHEDULED);
            
            logger.info("Found {} appointments pending voice notifications", pendingNotifications.size());

            for (Appointment appointment : pendingNotifications) {
                try {
                    sendVoiceNotification(appointment);
                    Thread.sleep(1000); // Rate limiting - 1 second between calls
                } catch (Exception e) {
                    logger.error("Failed to send notification for appointment {}", appointment.getId(), e);
                }
            }
        } catch (Exception e) {
            logger.error("Error in bulk notification process", e);
        }
    }
}
