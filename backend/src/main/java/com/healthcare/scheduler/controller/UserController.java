package com.healthcare.scheduler.controller;

import com.healthcare.scheduler.model.User;
import com.healthcare.scheduler.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable User.UserRole role) {
        List<User> users = userRepository.findByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/healthcare-workers")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<List<User>> getHealthcareWorkers() {
        List<User> workers = userRepository.findByRole(User.UserRole.HEALTHCARE_WORKER);
        return ResponseEntity.ok(workers);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SCHEDULER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
