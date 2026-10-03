package com.carrental.backend.constants;

public final class ValidationLimits {
	public static final int USER_NAME_MAX_LENGTH = 100;
	public static final int USER_EMAIL_MAX_LENGTH = 254;
	public static final int USER_PASSWORD_MIN_LENGTH = 8;
	public static final int USER_PASSWORD_MAX_LENGTH = 128;
	public static final int VEHICLE_REG_NUMBER_MAX_LENGTH = 20;
	public static final int VEHICLE_MODEL_MAX_LENGTH = 100;
	public static final int VEHICLE_LOCATION_MAX_LENGTH = 100;

	private ValidationLimits() {
	}
}