package com.rentify.repository;

import com.rentify.model.Transaction;
import com.rentify.model.enums.TransactionStatus;
import com.rentify.model.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByBookingId(Long bookingId);
    
    Optional<Transaction> findByStripeRef(String stripeRef);
    
    Optional<Transaction> findByPaystackRef(String paystackRef);
    
    List<Transaction> findByTypeAndStatus(TransactionType type, TransactionStatus status);
}
