package com.carrental.backend.controller;

import java.time.LocalDate;
import java.util.Locale;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.dto.VehicleDtos.VehicleRequest;
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

	@PostMapping
	public ResponseEntity<Vehicle> createVehicle(@jakarta.validation.Valid @RequestBody VehicleRequest request) {
		String regNumber = normalizeRegNumber(request.regNumber());
		ensureRegistrationNumberAvailable(regNumber, null);

		Vehicle vehicle = new Vehicle(
				regNumber,
				request.model().trim(),
				request.dailyRate(),
				request.location().trim());
		return ResponseEntity.status(HttpStatus.CREATED).body(vehicleRepository.save(vehicle));
	}

	@PutMapping("/{id}")
	public Vehicle updateVehicle(
			@PathVariable Long id,
			@jakarta.validation.Valid @RequestBody VehicleRequest request) {
		Vehicle vehicle = vehicleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found."));
		String regNumber = normalizeRegNumber(request.regNumber());
		ensureRegistrationNumberAvailable(regNumber, id);

		vehicle.setRegNumber(regNumber);
		vehicle.setModel(request.model().trim());
		vehicle.setDailyRate(request.dailyRate());
		vehicle.setLocation(request.location().trim());
		return vehicleRepository.save(vehicle);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
		Vehicle vehicle = vehicleRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found."));
		vehicleRepository.delete(vehicle);
		return ResponseEntity.noContent().build();
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

	private String normalizeRegNumber(String regNumber) {
		return regNumber.trim().toUpperCase(Locale.ROOT);
	}

	private void ensureRegistrationNumberAvailable(String regNumber, Long vehicleId) {
		boolean duplicate = vehicleId == null
				? vehicleRepository.existsByRegNumberIgnoreCase(regNumber)
				: vehicleRepository.existsByRegNumberIgnoreCaseAndIdNot(regNumber, vehicleId);
		if (duplicate) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration number is already in use.");
		}
	}
}
