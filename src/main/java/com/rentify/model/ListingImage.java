package com.rentify.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "listing_images", indexes = {
    @Index(name = "idx_listing_images_listing_id", columnList = "listing_id")
})
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"listing"})
@ToString(exclude = {"listing"})
@NoArgsConstructor
@AllArgsConstructor
public class ListingImage extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @Column(nullable = false, length = 500)
    private String url;
    
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;
    
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
}
