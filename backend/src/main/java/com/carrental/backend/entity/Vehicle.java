package com.carrental.backend.entity;

import java.math.BigDecimal;
import java.util.Objects;

import com.carrental.backend.constants.ValidationLimits;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "vehicles")
public class Vehicle {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = ValidationLimits.VEHICLE_REG_NUMBER_MAX_LENGTH)
	@Column(nullable = false, unique = true, length = ValidationLimits.VEHICLE_REG_NUMBER_MAX_LENGTH)
	private String regNumber;

	@NotBlank
	@Size(max = ValidationLimits.VEHICLE_MODEL_MAX_LENGTH)
	@Column(nullable = false, length = ValidationLimits.VEHICLE_MODEL_MAX_LENGTH)
	private String model;

	@NotNull
	@Positive
	@Column(nullable = false)
	private BigDecimal dailyRate;

	@NotBlank
	@Size(max = ValidationLimits.VEHICLE_LOCATION_MAX_LENGTH)
	@Column(nullable = false, length = ValidationLimits.VEHICLE_LOCATION_MAX_LENGTH)
	private String location;

	protected Vehicle() {
	}

	public Vehicle(String regNumber, String model, BigDecimal dailyRate, String location) {
		this.regNumber = regNumber;
		this.model = model;
		this.dailyRate = dailyRate;
		this.location = location;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getRegNumber() {
		return regNumber;
	}

	public void setRegNumber(String regNumber) {
		this.regNumber = regNumber;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String model) {
		this.model = model;
	}

	public BigDecimal getDailyRate() {
		return dailyRate;
	}

	public void setDailyRate(BigDecimal dailyRate) {
		this.dailyRate = dailyRate;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof Vehicle other)) {
			return false;
		}
		return Objects.equals(id, other.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}