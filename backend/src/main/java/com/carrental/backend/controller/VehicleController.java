package com.carrental.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.backend.entity.Vehicle;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.VehicleRepository;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {
	private final VehicleRepository vehicleRepository;
	private final BookingRepository bookingRepository;

	public VehicleController(VehicleRepository vehicleRepository, BookingRepository bookingRepository) {
		this.vehicleRepository = vehicleRepository;
		this.bookingRepository = bookingRepository;
	}

	@GetMapping
	public List<Vehicle> getAllVehicles() {
		return vehicleRepository.findAll();
	}

	@GetMapping("/search")
	public ResponseEntity<List<Vehicle>> searchVehicles(
			@RequestParam String location,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dropoffDate) {
		List<Vehicle> matchingVehicles = vehicleRepository.findByLocationIgnoreCase(location.trim());

		if (pickupDate == null || dropoffDate == null) {
			return ResponseEntity.ok(matchingVehicles);
		}

		List<Vehicle> availableVehicles = matchingVehicles.stream()
				.filter(vehicle -> !bookingRepository.existsOverlappingBooking(vehicle.getId(), pickupDate, dropoffDate))
				.toList();
		return ResponseEntity.ok(availableVehicles);
	}
}
