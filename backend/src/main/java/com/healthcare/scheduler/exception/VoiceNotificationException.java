package com.healthcare.scheduler.exception;

public class VoiceNotificationException extends RuntimeException {
    
    public VoiceNotificationException(String message) {
        super(message);
    }
    
    public VoiceNotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
