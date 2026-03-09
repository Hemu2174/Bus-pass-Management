package com.smartbuspass.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "routes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Route {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depot_id")
    @JsonIgnore
    private Depot depot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private double[][] coordinates;

    // Expose depotId for frontend compatibility
    public String getDepotId() { return depot != null ? depot.getId() : null; }
}
