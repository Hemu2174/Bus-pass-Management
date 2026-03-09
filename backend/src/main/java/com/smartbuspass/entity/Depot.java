package com.smartbuspass.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "depots")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Depot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;
}
