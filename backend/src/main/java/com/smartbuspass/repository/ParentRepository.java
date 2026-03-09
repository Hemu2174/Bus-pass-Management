package com.smartbuspass.repository;

import com.smartbuspass.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, String> {
    Optional<Parent> findByEmail(String email);
    Optional<Parent> findByEmailAndFatherName(String email, String fatherName);
}
