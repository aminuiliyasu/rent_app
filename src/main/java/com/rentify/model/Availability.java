package com.rentify.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "availability", indexes = {
    @Index(name = "idx_listing_date", columnList = "listing_id,date"),
    @Index(name = "idx_date", columnList = "date")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Availability extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    // For workers - specific hours
    @Column(name = "start_hour")
    private Integer startHour; // 0-23
    
    @Column(name = "end_hour")
    private Integer endHour; // 0-23
}
