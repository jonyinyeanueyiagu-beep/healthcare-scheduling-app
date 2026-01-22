package com.healthcare.scheduler.service;

import com.azure.communication.callautomation.CallAutomationClient;
import com.azure.communication.callautomation.CallAutomationClientBuilder;
import com.azure.communication.callautomation.models.*;
import com.azure.communication.common.PhoneNumberIdentifier;
import com.healthcare.scheduler.model.Appointment;
import com.healthcare.scheduler.model.Client;
import com.healthcare.scheduler.repository.AppointmentRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Collections;

@Service
public class AzureVoiceService {

    private static final Logger logger = LoggerFactory.getLogger(AzureVoiceService.class);

    @Value("${azure.communication.connection-string}")
    private String connectionString;

    @Value("${azure.communication.phone-number}")
    private String azurePhoneNumber;

    @Value("${azure.communication.callback-url}")
    private String callbackUrl;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private CallAutomationClient callAutomationClient;

    @PostConstruct
    public void init() {
        try {
            callAutomationClient = new CallAutomationClientBuilder()
                    .connectionString(connectionString)
                    .buildClient();
            logger.info("Azure Communication Services initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Azure Communication Services: {}", e.getMessage());
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

            // Create call participants
            PhoneNumberIdentifier target = new PhoneNumberIdentifier(client.getPhoneNumber());
            PhoneNumberIdentifier caller = new PhoneNumberIdentifier(azurePhoneNumber);

            // Create call invitation
            CallInvite callInvite = new CallInvite(target, caller);

            // Initiate the call
            var callResult = callAutomationClient.createCall(callInvite, callbackUrl);
            
            if (callResult != null) {
                String callConnectionId = callResult.getCallConnectionProperties().getCallConnectionId();
                logger.info("Voice call initiated successfully. Call Connection ID: {}", callConnectionId);

                // Play the message using text-to-speech
                TextSource textSource = new TextSource()
                        .setText(message)
                        .setVoiceName("en-US-JennyNeural"); // Azure Neural Voice

                callAutomationClient.getCallConnection(callConnectionId)
                        .getCallMedia()
                        .play(textSource, Collections.singletonList(target));

                appointment.setVoiceNotificationSent(true);
                appointmentRepository.save(appointment);
            }

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
                    Thread.sleep(2000); // Rate limiting - 2 seconds between calls
                } catch (Exception e) {
                    logger.error("Failed to send notification for appointment {}", appointment.getId(), e);
                }
            }
        } catch (Exception e) {
            logger.error("Error in bulk notification process", e);
        }
    }
}
