package com.smartbuspass.controller;

import com.smartbuspass.dto.BusPassDto.*;
import com.smartbuspass.entity.BusPass;
import com.smartbuspass.entity.Payment;
import com.smartbuspass.repository.BusPassRepository;
import com.smartbuspass.repository.PaymentRepository;
import com.smartbuspass.service.BusPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BusPassController {

    private final BusPassService passService;
    private final PaymentRepository paymentRepo;
    private final BusPassRepository busPassRepo;

    @GetMapping("/bus-passes")
    public ResponseEntity<List<BusPass>> getPasses(@RequestParam(required = false) String studentId) {
        if (studentId != null) return ResponseEntity.ok(passService.getByStudent(studentId));
        return ResponseEntity.ok(passService.getAll());
    }

    @PostMapping("/bus-passes")
    public ResponseEntity<BusPass> applyPass(@RequestBody ApplyRequest req) {
        return ResponseEntity.ok(passService.applyPass(req));
    }

    @PutMapping("/bus-passes/{id}/renew")
    public ResponseEntity<BusPass> renewPass(@PathVariable String id, @RequestBody RenewRequest req) {
        return ResponseEntity.ok(passService.renewPass(id, req));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getPayments(@RequestParam(required = false) String busPassId) {
        if (busPassId != null) return ResponseEntity.ok(paymentRepo.findByBusPass_Id(busPassId));
        return ResponseEntity.ok(paymentRepo.findAll());
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest req) {
        if (req.getBusPassId() == null || req.getBusPassId().isBlank()) {
            throw new RuntimeException("busPassId is required");
        }

        BusPass pass = busPassRepo.findById(req.getBusPassId())
                .orElseThrow(() -> new RuntimeException("Bus pass not found"));

        Payment payment = Payment.builder()
                .busPass(pass)
                .status(Payment.PaymentStatus.SUCCESS)
                .date(LocalDate.now())
                .amount(BigDecimal.valueOf(req.getAmount()))
                .build();

        return ResponseEntity.ok(paymentRepo.save(payment));
    }
}
