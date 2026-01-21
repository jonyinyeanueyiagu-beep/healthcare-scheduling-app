package com.healthcare.scheduler.controller;

import com.healthcare.scheduler.model.Appointment;
import com.healthcare.scheduler.repository.AppointmentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

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
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody Appointment appointment) {
        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @Valid @RequestBody Appointment details) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setScheduledTime(details.getScheduledTime());
                    appointment.setDurationMinutes(details.getDurationMinutes());
                    appointment.setStatus(details.getStatus());
                    appointment.setNotes(details.getNotes());
                    appointment.setCareProvided(details.getCareProvided());
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
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointmentRepository.delete(appointment);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}