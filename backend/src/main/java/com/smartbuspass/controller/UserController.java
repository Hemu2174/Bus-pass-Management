package com.smartbuspass.controller;

import com.smartbuspass.entity.Student;
import com.smartbuspass.entity.Parent;
import com.smartbuspass.entity.Route;
import com.smartbuspass.entity.BusPass;
import com.smartbuspass.repository.BusPassRepository;
import com.smartbuspass.repository.PaymentRepository;
import com.smartbuspass.repository.RouteRepository;
import com.smartbuspass.repository.StudentRepository;
import com.smartbuspass.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final StudentRepository studentRepo;
    private final ParentRepository parentRepo;
    private final RouteRepository routeRepo;
    private final BusPassRepository busPassRepo;
    private final PaymentRepository paymentRepo;

    @Data
    public static class StudentUpsertRequest {
        private String name;
        private String phone;
        private String email;
        private String parentId;
        private String routeId;
        private String password;
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getStudents(
            @RequestParam(required = false) String routeId,
            @RequestParam(required = false) String parentId) {
        if (routeId != null) return ResponseEntity.ok(studentRepo.findByRoute_Id(routeId));
        if (parentId != null) return ResponseEntity.ok(studentRepo.findByParent_Id(parentId));
        return ResponseEntity.ok(studentRepo.findAll());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable String id) {
        return studentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/students")
    public ResponseEntity<Student> createStudent(@RequestBody StudentUpsertRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) throw new RuntimeException("Email is required");
        if (req.getName() == null || req.getName().isBlank()) throw new RuntimeException("Name is required");
        if (req.getParentId() == null || req.getParentId().isBlank()) throw new RuntimeException("Parent is required");
        if (req.getRouteId() == null || req.getRouteId().isBlank()) throw new RuntimeException("Route is required");
        if (studentRepo.findByEmail(req.getEmail()).isPresent()) throw new RuntimeException("Email already exists");

        Parent parent = parentRepo.findById(req.getParentId())
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        Route route = routeRepo.findById(req.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        Student student = Student.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .parent(parent)
                .route(route)
                .password((req.getPassword() == null || req.getPassword().isBlank()) ? "password123" : req.getPassword())
                .build();

        return ResponseEntity.ok(studentRepo.save(student));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @RequestBody StudentUpsertRequest req) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (req.getName() != null && !req.getName().isBlank()) student.setName(req.getName());
        if (req.getPhone() != null) student.setPhone(req.getPhone());

        if (req.getEmail() != null && !req.getEmail().isBlank() && !req.getEmail().equals(student.getEmail())) {
            if (studentRepo.findByEmail(req.getEmail()).isPresent()) throw new RuntimeException("Email already exists");
            student.setEmail(req.getEmail());
        }

        if (req.getParentId() != null && !req.getParentId().isBlank()) {
            Parent parent = parentRepo.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            student.setParent(parent);
        }

        if (req.getRouteId() != null && !req.getRouteId().isBlank()) {
            Route route = routeRepo.findById(req.getRouteId())
                    .orElseThrow(() -> new RuntimeException("Route not found"));
            student.setRoute(route);
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            student.setPassword(req.getPassword());
        }

        return ResponseEntity.ok(studentRepo.save(student));
    }

    @DeleteMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<BusPass> studentPasses = busPassRepo.findByStudent_Id(id);
        for (BusPass pass : studentPasses) {
            paymentRepo.deleteByBusPass_Id(pass.getId());
        }
        if (!studentPasses.isEmpty()) {
            busPassRepo.deleteAll(studentPasses);
        }
        studentRepo.delete(student);
        return ResponseEntity.ok(java.util.Map.of("message", "Student deleted"));
    }

    @GetMapping("/parents")
    public ResponseEntity<List<Parent>> getParents() {
        return ResponseEntity.ok(parentRepo.findAll());
    }

    @GetMapping("/parents/{id}")
    public ResponseEntity<Parent> getParent(@PathVariable String id) {
        return parentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
