package com.rentify.repository;

import com.rentify.model.RentWishPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface RentWishPostRepository extends JpaRepository<RentWishPost, Long> {

    @EntityGraph(attributePaths = {"author"})
    Page<RentWishPost> findByCreatedAtAfter(LocalDateTime cutoff, Pageable pageable);
}
