package com.carrental.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.carrental.backend.entity.Booking;
import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;
import com.carrental.backend.entity.Vehicle;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.repository.VehicleRepository;

@SpringBootTest
@Transactional
class DomainPersistenceTests {
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private VehicleRepository vehicleRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Test
	void persistsDomainEntitiesAndResolvesRequiredRepositoryQueries() {
		User user = userRepository.save(new User("Renter", "renter@example.com", "password123", Role.USER));
		Vehicle vehicle = vehicleRepository.save(
				new Vehicle("CC-101", "City Compact", new BigDecimal("65.00"), "Central City"));

		assertThat(user.getId()).isNotNull();
		assertThat(userRepository.findByEmail("renter@example.com"))
				.contains(user);
		assertThat(userRepository.existsByEmail("renter@example.com")).isTrue();
		assertThat(vehicle.getId()).isNotNull();
		assertThat(vehicleRepository.existsByRegNumber("CC-101")).isTrue();

		Booking booking = bookingRepository.save(new Booking(
				user,
				vehicle,
				LocalDate.of(2026, 10, 10),
				LocalDate.of(2026, 10, 12)));
		Booking savedBooking = bookingRepository.findById(booking.getId()).orElseThrow();

		assertThat(savedBooking.getUser().getId()).isEqualTo(user.getId());
		assertThat(savedBooking.getVehicle().getId()).isEqualTo(vehicle.getId());
		assertThat(savedBooking.getStartDate()).isEqualTo(LocalDate.of(2026, 10, 10));
		assertThat(savedBooking.getEndDate()).isEqualTo(LocalDate.of(2026, 10, 12));
	}
}