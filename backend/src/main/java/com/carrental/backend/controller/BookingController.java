package com.carrental.backend.controller;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.entity.Booking;
import com.carrental.backend.entity.User;
import com.carrental.backend.entity.Vehicle;
import com.carrental.backend.auth.security.AuthenticatedUser;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.repository.VehicleRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/bookings")
public class BookingController {
	private final BookingRepository bookingRepository;
	private final UserRepository userRepository;
	private final VehicleRepository vehicleRepository;

	public BookingController(
			BookingRepository bookingRepository,
			UserRepository userRepository,
			VehicleRepository vehicleRepository) {
		this.bookingRepository = bookingRepository;
		this.userRepository = userRepository;
		this.vehicleRepository = vehicleRepository;
	}

	@PostMapping
	public ResponseEntity<BookingResponse> createBooking(
			@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
			@Valid @RequestBody BookingRequest request) {
		User user = userRepository.findById(authenticatedUser.userId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication."));
		Vehicle vehicle = vehicleRepository.findById(request.vehicleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found."));

		if (!request.endDate().isAfter(request.startDate())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end date must be after the start date.");
		}

		boolean overlaps = bookingRepository.existsOverlappingBooking(vehicle.getId(), request.startDate(), request.endDate());
		if (overlaps) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle is already booked for the chosen dates.");
		}

		Booking savedBooking = bookingRepository.save(new Booking(user, vehicle, request.startDate(), request.endDate()));
		return ResponseEntity.status(HttpStatus.CREATED).body(new BookingResponse(
				savedBooking.getId(),
				savedBooking.getUser().getId(),
				savedBooking.getVehicle().getId(),
				savedBooking.getStartDate(),
				savedBooking.getEndDate()));
	}

	public record BookingRequest(
			@NotNull Long vehicleId,
			@NotNull LocalDate startDate,
			@NotNull LocalDate endDate) {
	}

	public record BookingResponse(
			Long id,
			Long userId,
			Long vehicleId,
			LocalDate startDate,
			LocalDate endDate) {
	}
}
