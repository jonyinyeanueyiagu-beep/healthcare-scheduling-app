package com.healthcare.scheduler.repository;

import com.healthcare.scheduler.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByClientId(Long clientId);
    
    List<Appointment> findByCareWorkerId(Long careWorkerId);
    
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    
    List<Appointment> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.careWorker.id = :careWorkerId AND a.scheduledTime BETWEEN :start AND :end")
    List<Appointment> findByCareWorkerIdAndScheduledTimeBetween(Long careWorkerId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.status = :status AND a.voiceNotificationSent = false")
    List<Appointment> findByStatusAndVoiceNotificationSentFalse(Appointment.AppointmentStatus status);
}
