package com.carrental.backend.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.carrental.backend.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	@Query("select count(b) > 0 from Booking b where b.vehicle.id = :vehicleId and b.startDate < :dropoffDate and b.endDate > :pickupDate")
	boolean existsOverlappingBooking(
			@Param("vehicleId") Long vehicleId,
			@Param("pickupDate") LocalDate pickupDate,
			@Param("dropoffDate") LocalDate dropoffDate);
}