package com.smartbuspass.repository;

import com.smartbuspass.entity.BusPass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BusPassRepository extends JpaRepository<BusPass, String> {
    List<BusPass> findByStudent_Id(String studentId);
}
