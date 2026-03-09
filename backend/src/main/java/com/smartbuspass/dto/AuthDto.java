package com.smartbuspass.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class StudentLoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class ParentLoginRequest {
        private String email;
        private String password;
        private String fatherName;
    }

    @Data
    public static class AdminLoginRequest {
        private String name;
        private String password;
    }

    @Data
    public static class StudentRegisterRequest {
        private String name;
        private String fatherName;
        private String email;
        private String password;
        private String phone;
    }

    @Data
    public static class AdminRegisterRequest {
        private String name;
        private String depotId;
        private String routeId;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String role;
        private Object user;

        public LoginResponse(String token, String role, Object user) {
            this.token = token;
            this.role = role;
            this.user = user;
        }
    }
}
