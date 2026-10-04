package com.carrental.backend.dto;

import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;
import com.carrental.backend.constants.ValidationLimits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
	private AuthDtos() {
	}

	public record LoginRequest(
			@NotBlank @Email @Size(max = ValidationLimits.USER_EMAIL_MAX_LENGTH) String email,
			@NotBlank @Size(max = ValidationLimits.USER_PASSWORD_MAX_LENGTH) String password) {
	}

	public record RegisterRequest(
			@NotBlank @Size(max = ValidationLimits.USER_NAME_MAX_LENGTH) String name,
			@NotBlank @Email @Size(max = ValidationLimits.USER_EMAIL_MAX_LENGTH) String email,
			@NotBlank
			@Size(min = ValidationLimits.USER_PASSWORD_MIN_LENGTH, max = ValidationLimits.USER_PASSWORD_MAX_LENGTH)
			@Pattern(regexp = ValidationLimits.USER_PASSWORD_PATTERN,
					message = "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.")
			String password) {
	}

	public record UserResponse(Long id, String name, String email, Role role) {
		public static UserResponse from(User user) {
			return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
		}
	}

	public record AuthResponse(String token, String tokenType, long expiresIn, UserResponse user) {
	}
}