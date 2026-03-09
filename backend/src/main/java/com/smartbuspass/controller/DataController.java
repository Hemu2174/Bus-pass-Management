package com.smartbuspass.controller;

import com.smartbuspass.entity.Depot;
import com.smartbuspass.entity.Route;
import com.smartbuspass.repository.DepotRepository;
import com.smartbuspass.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DataController {

    private final DepotRepository depotRepo;
    private final RouteRepository routeRepo;

    @GetMapping("/depots")
    public ResponseEntity<List<Depot>> getDepots() {
        return ResponseEntity.ok(depotRepo.findAll());
    }

    @GetMapping("/routes")
    public ResponseEntity<List<Route>> getRoutes(@RequestParam(required = false) String depotId) {
        if (depotId != null) return ResponseEntity.ok(routeRepo.findByDepot_Id(depotId));
        return ResponseEntity.ok(routeRepo.findAll());
    }

    @GetMapping("/config/pass-price")
    public ResponseEntity<?> getPassPrice(@org.springframework.beans.factory.annotation.Value("${app.pass-price-per-month}") int price) {
        return ResponseEntity.ok(java.util.Map.of("pricePerMonth", price));
    }
}
