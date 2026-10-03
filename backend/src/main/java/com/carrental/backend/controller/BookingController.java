package com.carrental.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.entity.Booking;
import com.carrental.backend.entity.Role;
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

	@GetMapping
	public List<BookingResponse> getBookings(
			@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
		List<Booking> bookings = authenticatedUser.role() == Role.ADMIN
				? bookingRepository.findAllByOrderByStartDateAsc()
				: bookingRepository.findAllByUser_IdOrderByStartDateAsc(authenticatedUser.userId());

		return bookings.stream().map(this::toResponse).toList();
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
		return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(savedBooking));
	}

	@PutMapping("/{id}")
	public BookingResponse updateBooking(
			@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
			@PathVariable Long id,
			@Valid @RequestBody BookingRequest request) {
		Booking booking = findBookingForManagement(id, authenticatedUser);
		Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found."));
		validateDateRange(request.startDate(), request.endDate());

		if (bookingRepository.existsOtherOverlappingBooking(
				booking.getId(), vehicle.getId(), request.startDate(), request.endDate())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle is already booked for the chosen dates.");
		}

		booking.setVehicle(vehicle);
		booking.setStartDate(request.startDate());
		booking.setEndDate(request.endDate());
		return toResponse(bookingRepository.save(booking));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteBooking(
			@AuthenticationPrincipal AuthenticatedUser authenticatedUser,
			@PathVariable Long id) {
		Booking booking = findBookingForManagement(id, authenticatedUser);
		bookingRepository.delete(booking);
		return ResponseEntity.noContent().build();
	}

	private Booking findBookingForManagement(Long id, AuthenticatedUser authenticatedUser) {
		Booking booking = bookingRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));

		if (authenticatedUser.role() != Role.ADMIN
				&& !booking.getUser().getId().equals(authenticatedUser.userId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to manage this booking.");
		}

		return booking;
	}

	private void validateDateRange(LocalDate startDate, LocalDate endDate) {
		if (!endDate.isAfter(startDate)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end date must be after the start date.");
		}
	}

	private BookingResponse toResponse(Booking booking) {
		Vehicle vehicle = booking.getVehicle();
		return new BookingResponse(
				booking.getId(),
				booking.getUser().getId(),
				vehicle.getId(),
				booking.getStartDate(),
				booking.getEndDate(),
				new VehicleSummary(
						vehicle.getId(),
						vehicle.getModel(),
						vehicle.getRegNumber(),
						vehicle.getLocation(),
						vehicle.getDailyRate()));
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
			LocalDate endDate,
			VehicleSummary vehicle) {
	}

	public record VehicleSummary(
			Long id,
			String model,
			String regNumber,
			String location,
			BigDecimal dailyRate) {
	}
}
