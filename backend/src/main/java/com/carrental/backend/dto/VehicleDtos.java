package com.carrental.backend.dto;

import java.math.BigDecimal;

import com.carrental.backend.constants.ValidationLimits;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class VehicleDtos {
	private VehicleDtos() {
	}

	public record VehicleRequest(
			@NotBlank @Size(max = ValidationLimits.VEHICLE_REG_NUMBER_MAX_LENGTH) String regNumber,
			@NotBlank @Size(max = ValidationLimits.VEHICLE_MODEL_MAX_LENGTH) String model,
			@NotNull
			@DecimalMin(ValidationLimits.VEHICLE_DAILY_RATE_MIN)
			@DecimalMax(ValidationLimits.VEHICLE_DAILY_RATE_MAX)
			@Digits(integer = ValidationLimits.VEHICLE_DAILY_RATE_INTEGER_DIGITS, fraction = ValidationLimits.VEHICLE_DAILY_RATE_FRACTION_DIGITS) BigDecimal dailyRate,
			@NotBlank @Size(max = ValidationLimits.VEHICLE_LOCATION_MAX_LENGTH) String location) {
	}
}