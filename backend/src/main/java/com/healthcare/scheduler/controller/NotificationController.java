package com.healthcare.scheduler.controller;

import com.healthcare.scheduler.model.Appointment;
import com.healthcare.scheduler.repository.AppointmentRepository;
import com.healthcare.scheduler.service.AzureVoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private AzureVoiceService azureVoiceService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/voice/{appointmentId}")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<?> sendVoiceNotification(@PathVariable Long appointmentId) {
        try {
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));

            azureVoiceService.sendVoiceNotification(appointment);
            return ResponseEntity.ok("Voice notification sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send notification: " + e.getMessage());
        }
    }

    @PostMapping("/voice/bulk")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<?> sendBulkVoiceNotifications() {
        try {
            azureVoiceService.sendBulkNotifications();
            return ResponseEntity.ok("Bulk notifications process initiated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send bulk notifications: " + e.getMessage());
        }
    }
}
