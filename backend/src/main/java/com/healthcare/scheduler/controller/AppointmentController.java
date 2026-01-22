package com.healthcare.scheduler.controller;

import com.healthcare.scheduler.dto.AppointmentRequest;
import com.healthcare.scheduler.model.Appointment;
import com.healthcare.scheduler.model.Client;
import com.healthcare.scheduler.model.User;
import com.healthcare.scheduler.repository.AppointmentRepository;
import com.healthcare.scheduler.repository.ClientRepository;
import com.healthcare.scheduler.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
        
        User careWorker = userRepository.findById(request.getCareWorkerId())
                .orElseThrow(() -> new RuntimeException("Care worker not found"));

        if (careWorker.getRole() != User.UserRole.HEALTHCARE_WORKER) {
            return ResponseEntity.badRequest().body("Selected user is not a healthcare worker");
        }

        Appointment appointment = Appointment.builder()
                .client(client)
                .careWorker(careWorker)
                .scheduledTime(request.getScheduledTime())
                .durationMinutes(request.getDurationMinutes())
                .notes(request.getNotes())
                .careProvided(request.getCareProvided())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .voiceNotificationSent(false)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    Client client = clientRepository.findById(request.getClientId())
                            .orElseThrow(() -> new RuntimeException("Client not found"));
                    
                    User careWorker = userRepository.findById(request.getCareWorkerId())
                            .orElseThrow(() -> new RuntimeException("Care worker not found"));

                    appointment.setClient(client);
                    appointment.setCareWorker(careWorker);
                    appointment.setScheduledTime(request.getScheduledTime());
                    appointment.setDurationMinutes(request.getDurationMinutes());
                    appointment.setNotes(request.getNotes());
                    appointment.setCareProvided(request.getCareProvided());
                    
                    Appointment updated = appointmentRepository.save(appointment);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByClient(@PathVariable Long clientId) {
        List<Appointment> appointments = appointmentRepository.findByClientId(clientId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/careworker/{careWorkerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCareWorker(@PathVariable Long careWorkerId) {
        List<Appointment> appointments = appointmentRepository.findByCareWorkerId(careWorkerId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable Appointment.AppointmentStatus status) {
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(@PathVariable Long id, @RequestParam Appointment.AppointmentStatus status) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(status);
                    if (status == Appointment.AppointmentStatus.IN_PROGRESS) {
                        appointment.setCheckInTime(LocalDateTime.now());
                    } else if (status == Appointment.AppointmentStatus.COMPLETED) {
                        appointment.setCheckOutTime(LocalDateTime.now());
                    }
                    Appointment updated = appointmentRepository.save(appointment);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentRepository.delete(appointment);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}