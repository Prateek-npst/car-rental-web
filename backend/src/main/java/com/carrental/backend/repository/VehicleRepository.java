package com.carrental.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.backend.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
	boolean existsByRegNumber(String regNumber);

	boolean existsByRegNumberIgnoreCase(String regNumber);

	boolean existsByRegNumberIgnoreCaseAndIdNot(String regNumber, Long id);

	List<Vehicle> findByLocationIgnoreCase(String location);
}