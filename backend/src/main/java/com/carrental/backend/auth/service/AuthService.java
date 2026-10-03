package com.carrental.backend.auth.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.auth.security.JwtService;
import com.carrental.backend.dto.AuthDtos.AuthResponse;
import com.carrental.backend.dto.AuthDtos.LoginRequest;
import com.carrental.backend.dto.AuthDtos.RegisterRequest;
import com.carrental.backend.dto.AuthDtos.UserResponse;
import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;
import com.carrental.backend.repository.UserRepository;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public UserResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
		}

		User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()), Role.USER);
		return UserResponse.from(userRepository.save(user));
	}

	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email())).orElse(null);
		if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
		}

		return new AuthResponse(jwtService.generateToken(user), "Bearer", jwtService.getExpirationSeconds(),
				UserResponse.from(user));
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}