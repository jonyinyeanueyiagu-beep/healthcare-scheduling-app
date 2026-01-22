package com.healthcare.scheduler.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {
    
    @NotNull(message = "Client ID is required")
    private Long clientId;
    
    @NotNull(message = "Care worker ID is required")
    private Long careWorkerId;
    
    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;
    
    @NotNull(message = "Duration is required")
    private Integer durationMinutes;
    
    private String notes;
    
    private String careProvided;
}
