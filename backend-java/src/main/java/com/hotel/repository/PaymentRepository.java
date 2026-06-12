package com.hotel.repository;

import com.hotel.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    @Query("SELECT SUM(p.amount) FROM Payment p")
    Double getTotalRevenue();

    @Query("SELECT p.paymentDate as date, SUM(p.amount) as total FROM Payment p GROUP BY p.paymentDate ORDER BY p.paymentDate DESC")
    List<Object[]> getDailyRevenue();
    
    void deleteByBookingBookingId(Long bookingId);
}
