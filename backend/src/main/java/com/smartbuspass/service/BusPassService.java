package com.smartbuspass.service;

import com.smartbuspass.dto.BusPassDto.*;
import com.smartbuspass.entity.*;
import com.smartbuspass.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusPassService {

    private final BusPassRepository passRepo;
    private final PaymentRepository paymentRepo;
    private final StudentRepository studentRepo;
    private final RouteRepository routeRepo;

    @Value("${app.pass-price-per-month}")
    private int pricePerMonth;

    public List<BusPass> getAll() { return passRepo.findAll(); }

        public List<BusPass> getByStudent(String studentId) { return passRepo.findByStudent_Id(studentId); }

    @Transactional
    public BusPass applyPass(ApplyRequest req) {
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Route route = routeRepo.findById(req.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found"));

        LocalDate today = LocalDate.now();
        LocalDate expiry = today.plusMonths(req.getMonths());

        BusPass pass = BusPass.builder()
                .student(student).route(route)
                .startDate(today).expiryDate(expiry)
                .months(req.getMonths())
                .status(BusPass.PassStatus.ACTIVE)
                .build();
        pass = passRepo.save(pass);

        // Update student route
        student.setRoute(route);
        studentRepo.save(student);

        // Create payment
        Payment payment = Payment.builder()
                .busPass(pass)
                .status(Payment.PaymentStatus.SUCCESS)
                .date(today)
                .amount(BigDecimal.valueOf((long) req.getMonths() * pricePerMonth))
                .build();
        paymentRepo.save(payment);

        return pass;
    }

    @Transactional
    public BusPass renewPass(String passId, RenewRequest req) {
        BusPass pass = passRepo.findById(passId)
                .orElseThrow(() -> new RuntimeException("Pass not found"));

        LocalDate baseDate = pass.getStatus() == BusPass.PassStatus.ACTIVE
                ? pass.getExpiryDate() : LocalDate.now();
        LocalDate newExpiry = baseDate.plusMonths(req.getMonths());

        if (pass.getStatus() != BusPass.PassStatus.ACTIVE) {
            pass.setStartDate(LocalDate.now());
        }
        pass.setExpiryDate(newExpiry);
        pass.setMonths(pass.getMonths() + req.getMonths());
        pass.setStatus(BusPass.PassStatus.ACTIVE);
        pass = passRepo.save(pass);

        Payment payment = Payment.builder()
                .busPass(pass)
                .status(Payment.PaymentStatus.SUCCESS)
                .date(LocalDate.now())
                .amount(BigDecimal.valueOf((long) req.getMonths() * pricePerMonth))
                .build();
        paymentRepo.save(payment);

        return pass;
    }

    public int getPricePerMonth() { return pricePerMonth; }
}
