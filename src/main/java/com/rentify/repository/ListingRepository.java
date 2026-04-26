package com.rentify.repository;

import com.rentify.model.Listing;
import com.rentify.model.enums.ListingStatus;
import com.rentify.model.enums.ListingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.owner.id = :ownerId AND l.status = :status")
    Page<Listing> findByOwnerIdAndStatus(@Param("ownerId") Long ownerId, @Param("status") ListingStatus status, Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.category.id = :categoryId AND l.status = :status")
    Page<Listing> findByCategoryIdAndStatus(@Param("categoryId") Long categoryId, @Param("status") ListingStatus status, Pageable pageable);
    
    Page<Listing> findByTypeAndStatus(ListingType type, ListingStatus status, Pageable pageable);
    
    @Query(value = "SELECT * FROM listings l WHERE l.status = :status " +
           "AND l.lat IS NOT NULL AND l.lng IS NOT NULL " +
           "AND (6371 * acos(cos(radians(:lat)) * cos(radians(l.lat)) * " +
           "cos(radians(l.lng) - radians(:lng)) + sin(radians(:lat)) * sin(radians(l.lat)))) <= :radius",
           nativeQuery = true)
    Page<Listing> findNearbyListings(@Param("lat") Double lat, 
                                      @Param("lng") Double lng, 
                                      @Param("radius") Double radius,
                                      @Param("status") String status,
                                      Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.status = :status " +
           "AND (:categoryId IS NULL OR l.category.id = :categoryId) " +
           "AND (:type IS NULL OR l.type = :type) " +
           "AND (:minPrice IS NULL OR l.priceDay >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.priceDay <= :maxPrice) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Listing> searchListings(@Param("search") String search,
                                 @Param("categoryId") Long categoryId,
                                 @Param("type") ListingType type,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("status") ListingStatus status,
                                 Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.isFeatured = true AND l.status = :status ORDER BY l.boostUntil DESC")
    List<Listing> findByIsFeaturedTrueAndStatusOrderByBoostUntilDesc(@Param("status") ListingStatus status);
    
    @Query("SELECT l FROM Listing l WHERE l.owner.id = :ownerId")
    Page<Listing> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);
    
    long countByStatus(ListingStatus status);
    
    long countByTypeAndStatus(ListingType type, ListingStatus status);
}
