package com.smartbuspass.service;

import com.smartbuspass.dto.AuthDto.*;
import com.smartbuspass.entity.*;
import com.smartbuspass.repository.*;
import com.smartbuspass.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepo;
    private final ParentRepository parentRepo;
    private final AdminRepository adminRepo;
    private final RouteRepository routeRepo;
    private final DepotRepository depotRepo;
    private final JwtUtil jwtUtil;

    public LoginResponse loginStudent(StudentLoginRequest req) {
        Student student = studentRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!req.getPassword().equals(student.getPassword()))
            throw new RuntimeException("Invalid credentials");
        String token = jwtUtil.generateToken(student.getId(), "student");
        return new LoginResponse(token, "student", student);
    }

    public LoginResponse loginParent(ParentLoginRequest req) {
        Parent parent = parentRepo.findByEmailAndFatherName(req.getEmail(), req.getFatherName())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!req.getPassword().equals(parent.getPassword()))
            throw new RuntimeException("Invalid credentials");
        String token = jwtUtil.generateToken(parent.getId(), "parent");
        return new LoginResponse(token, "parent", parent);
    }

    public LoginResponse loginAdmin(AdminLoginRequest req) {
        Admin admin = adminRepo.findByName(req.getName())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!req.getPassword().equals(admin.getPassword()))
            throw new RuntimeException("Invalid credentials");
        String token = jwtUtil.generateToken(admin.getId(), "admin");
        return new LoginResponse(token, "admin", admin);
    }

    public LoginResponse registerStudent(StudentRegisterRequest req) {
        if (studentRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Find or create parent
        Parent parent = parentRepo.findByEmail(req.getEmail()).orElseGet(() -> {
            Parent p = Parent.builder()
                    .fatherName(req.getFatherName())
                    .email(req.getEmail())
                    .password(req.getPassword())
                    .build();
            return parentRepo.save(p);
        });

        Student student = Student.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .password(req.getPassword())
                .parent(parent)
                .build();
        student = studentRepo.save(student);

        String token = jwtUtil.generateToken(student.getId(), "student");
        return new LoginResponse(token, "student", student);
    }

    public LoginResponse registerAdmin(AdminRegisterRequest req) {
        Depot depot = depotRepo.findById(req.getDepotId())
                .orElseThrow(() -> new RuntimeException("Depot not found"));
        Route route = routeRepo.findById(req.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Admin admin = Admin.builder()
                .name(req.getName())
                .password(req.getPassword())
                .depot(depot)
                .route(route)
                .build();
        admin = adminRepo.save(admin);

        String token = jwtUtil.generateToken(admin.getId(), "admin");
        return new LoginResponse(token, "admin", admin);
    }
}
