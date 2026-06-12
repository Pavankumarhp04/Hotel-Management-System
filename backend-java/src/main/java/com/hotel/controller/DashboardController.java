package com.hotel.controller;

import com.hotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        LocalDate today = LocalDate.now();
        long totalRoomsCount = roomRepository.count();
        long bookedRoomsCount = bookingRepository.countActiveBookings(today);
        long totalCustomersCount = customerRepository.count();
        Double totalRevenue = paymentRepository.getTotalRevenue();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRooms", totalRoomsCount);
        stats.put("bookedRooms", bookedRoomsCount);
        stats.put("availableRooms", Math.max(0, totalRoomsCount - bookedRoomsCount));
        stats.put("totalCustomers", totalCustomersCount);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return stats;
    }
}
