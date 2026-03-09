package com.smartbuspass.repository;

import com.smartbuspass.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByBusPass_Id(String busPassId);
    void deleteByBusPass_Id(String busPassId);
}
