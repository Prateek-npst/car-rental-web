package com.carrental.backend.auth.service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.auth.security.JwtService;
import com.carrental.backend.dto.AuthDtos.AuthResponse;
import com.carrental.backend.dto.AuthDtos.LoginRequest;
import com.carrental.backend.dto.AuthDtos.RegisterRequest;
import com.carrental.backend.dto.AuthDtos.UserResponse;
import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.RefreshToken;
import com.carrental.backend.entity.User;
import com.carrental.backend.repository.RefreshTokenRepository;
import com.carrental.backend.repository.UserRepository;

@Service
public class AuthService {
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final Duration refreshTokenExpiration;

	public AuthService(
			UserRepository userRepository,
			RefreshTokenRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			@Value("${app.auth.refresh-token-expiration:P14D}") Duration refreshTokenExpiration) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		if (refreshTokenExpiration.isZero() || refreshTokenExpiration.isNegative()) {
			throw new IllegalStateException("Refresh token expiration must be a positive duration.");
		}
		this.refreshTokenExpiration = refreshTokenExpiration;
	}

	public UserResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered.");
		}

		User user = new User(request.name().trim(), email, passwordEncoder.encode(request.password()), Role.USER);
		return UserResponse.from(userRepository.save(user));
	}

	@Transactional
	public AuthSession login(LoginRequest request) {
		User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email())).orElse(null);
		if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
		}

		return createSession(user);
	}

	@Transactional
	public Optional<AuthSession> refresh(String rawToken) {
		if (rawToken == null || rawToken.isBlank()) {
			return Optional.empty();
		}

		Optional<RefreshToken> tokenResult = refreshTokenRepository.findByTokenHashForUpdate(hashToken(rawToken));
		if (tokenResult.isEmpty()) {
			return Optional.empty();
		}

		RefreshToken storedToken = tokenResult.get();
		Instant now = Instant.now();
		if (storedToken.getRevokedAt() != null) {
			refreshTokenRepository.revokeAllForUser(storedToken.getUser().getId(), now);
			return Optional.empty();
		}
		if (!storedToken.getExpiresAt().isAfter(now)) {
			storedToken.revoke(now);
			return Optional.empty();
		}

		storedToken.revoke(now);
		return Optional.of(createSession(storedToken.getUser()));
	}

	@Transactional
	public void logout(String rawToken) {
		if (rawToken == null || rawToken.isBlank()) {
			return;
		}

		refreshTokenRepository.findByTokenHashForUpdate(hashToken(rawToken))
				.filter(token -> token.getRevokedAt() == null)
					.ifPresent(token -> token.revoke(Instant.now()));
	}

	private AuthSession createSession(User user) {
		Instant now = Instant.now();
		byte[] randomBytes = new byte[32];
		SECURE_RANDOM.nextBytes(randomBytes);
		String rawRefreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
		refreshTokenRepository.save(new RefreshToken(
				hashToken(rawRefreshToken), user, now.plus(refreshTokenExpiration), now));

		AuthResponse response = new AuthResponse(
				jwtService.generateToken(user), "Bearer", jwtService.getExpirationSeconds(), UserResponse.from(user));
		return new AuthSession(response, rawRefreshToken);
	}

	private String hashToken(String token) {
		try {
			byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
			return java.util.HexFormat.of().formatHex(digest);
		} catch (java.security.NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available.", exception);
		}
	}

	private String normalizeEmail(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	public record AuthSession(AuthResponse response, String refreshToken) {
	}
}