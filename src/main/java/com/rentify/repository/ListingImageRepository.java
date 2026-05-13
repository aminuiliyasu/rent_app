package com.rentify.repository;

import com.rentify.model.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    /** Property path is listing.id (FK listing_id). */
    List<ListingImage> findByListing_IdOrderBySortOrderAsc(Long listingId);

    void deleteByListing_Id(Long listingId);
}
