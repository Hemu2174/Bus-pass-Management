package com.smartbuspass.dto;

import lombok.Data;

public class BusPassDto {

    @Data
    public static class ApplyRequest {
        private String studentId;
        private String routeId;
        private int months;
    }

    @Data
    public static class RenewRequest {
        private int months;
    }

    @Data
    public static class PaymentRequest {
        private String busPassId;
        private double amount;
    }
}
