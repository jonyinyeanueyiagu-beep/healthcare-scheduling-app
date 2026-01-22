package com.healthcare.scheduler.repository;

import com.healthcare.scheduler.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    List<Client> findByActiveTrue();
    
    List<Client> findByLastNameContainingIgnoreCase(String lastName);
    
    List<Client> findByCity(String city);
}
