package com.hotel.repository;

import com.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    @Query("SELECT b FROM Booking b WHERE b.room.roomId = :roomId " +
           "AND b.status NOT IN ('Cancelled', 'Checked-out') " +
           "AND ((b.checkIn BETWEEN :start AND :end) OR (b.checkOut BETWEEN :start AND :end) OR (:start BETWEEN b.checkIn AND b.checkOut))")
    List<Booking> findOverlappingBookings(@Param("roomId") Long roomId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(DISTINCT b.room.roomId) FROM Booking b " +
           "WHERE b.status IN ('Confirmed', 'Checked-in') " +
           "AND (:today BETWEEN b.checkIn AND b.checkOut)")
    Long countActiveBookings(@Param("today") LocalDate today);
}
