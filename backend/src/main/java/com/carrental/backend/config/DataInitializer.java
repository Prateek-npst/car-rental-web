package com.carrental.backend.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.carrental.backend.entity.Booking;
import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;
import com.carrental.backend.entity.Vehicle;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.repository.VehicleRepository;

@Configuration
@Profile("!test")
public class DataInitializer {
	@Bean
	CommandLineRunner seedDemoData(
			UserRepository userRepository,
			VehicleRepository vehicleRepository,
			BookingRepository bookingRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.count() == 0) {
				userRepository.save(new User("Renter", "Renter@example.com", passwordEncoder.encode("Password@123"), Role.USER));
			}

			if (vehicleRepository.count() == 0) {
				Vehicle cityCompact = vehicleRepository.save(
						new Vehicle("CC-101", "City Compact", new BigDecimal("65.00"), "Central City"));
				Vehicle citySedan = vehicleRepository.save(
						new Vehicle("CC-202", "City Sedan", new BigDecimal("85.00"), "Central City"));
				Vehicle trailSuv = vehicleRepository.save(
						new Vehicle("NH-303", "Trail SUV", new BigDecimal("110.00"), "North Harbor"));

				if (bookingRepository.count() == 0) {
					User renter = userRepository.findByEmail("Renter@example.com").orElseThrow();
					bookingRepository.save(new Booking(renter, cityCompact, LocalDate.of(2026, 10, 10), LocalDate.of(2026, 10, 15)));
					bookingRepository.save(new Booking(renter, citySedan, LocalDate.of(2026, 10, 18), LocalDate.of(2026, 10, 20)));
				}

				vehicleRepository.save(trailSuv);
			}
		};
	}
}
