package com.smartbuspass.controller;

import com.smartbuspass.dto.AuthDto.*;
import com.smartbuspass.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login/student")
    public ResponseEntity<LoginResponse> loginStudent(@RequestBody StudentLoginRequest req) {
        return ResponseEntity.ok(authService.loginStudent(req));
    }

    @PostMapping("/login/parent")
    public ResponseEntity<LoginResponse> loginParent(@RequestBody ParentLoginRequest req) {
        return ResponseEntity.ok(authService.loginParent(req));
    }

    @PostMapping("/login/admin")
    public ResponseEntity<LoginResponse> loginAdmin(@RequestBody AdminLoginRequest req) {
        return ResponseEntity.ok(authService.loginAdmin(req));
    }

    @PostMapping("/register/student")
    public ResponseEntity<LoginResponse> registerStudent(@RequestBody StudentRegisterRequest req) {
        return ResponseEntity.ok(authService.registerStudent(req));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<LoginResponse> registerAdmin(@RequestBody AdminRegisterRequest req) {
        return ResponseEntity.ok(authService.registerAdmin(req));
    }
}
