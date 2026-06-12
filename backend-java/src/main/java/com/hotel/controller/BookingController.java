package com.hotel.controller;

import com.hotel.model.Booking;
import com.hotel.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        // Check availability
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
            booking.getRoom().getRoomId(), 
            booking.getCheckIn(), 
            booking.getCheckOut()
        );
        
        if (!overlaps.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Room already booked for these dates"));
        }
        
        booking.setStatus("Confirmed");
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/{id}/status")
    public Booking updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setStatus(statusMap.get("status"));
        return bookingRepository.save(booking);
    }
}
