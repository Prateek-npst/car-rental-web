package com.carrental.backend.controller;

import java.time.Duration;
import java.util.Optional;

import jakarta.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.carrental.backend.auth.service.AuthService;
import com.carrental.backend.constants.ApiPaths;
import com.carrental.backend.dto.AuthDtos.AuthResponse;
import com.carrental.backend.dto.AuthDtos.LoginRequest;
import com.carrental.backend.dto.AuthDtos.RegisterRequest;
import com.carrental.backend.dto.AuthDtos.UserResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping(ApiPaths.AUTH_BASE)
public class AuthController {
	private static final String REFRESH_COOKIE = "refresh_token";
	private static final String ACTION_HEADER = "X-Auth-Action";
	private final AuthService authService;
	private final ServletContext servletContext;
	private final Duration refreshTokenExpiration;
	private final boolean secureRefreshCookie;

	public AuthController(
			AuthService authService,
			ServletContext servletContext,
			@Value("${app.auth.refresh-token-expiration:P14D}") Duration refreshTokenExpiration,
			@Value("${app.auth.refresh-cookie-secure:false}") boolean secureRefreshCookie) {
		this.authService = authService;
		this.servletContext = servletContext;
		this.refreshTokenExpiration = refreshTokenExpiration;
		this.secureRefreshCookie = secureRefreshCookie;
	}

	@PostMapping(ApiPaths.AUTH_REGISTER)
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
	}

	@PostMapping(ApiPaths.AUTH_LOGIN)
	public ResponseEntity<AuthResponse> login(
			@Valid @RequestBody LoginRequest request,
			@RequestHeader(ACTION_HEADER) String action) {
		requireAction(action, "login");
		AuthService.AuthSession session = authService.login(request);
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, refreshCookie(session.refreshToken()).toString())
				.body(session.response());
	}

	@PostMapping(ApiPaths.AUTH_REFRESH)
	public ResponseEntity<AuthResponse> refresh(
			@CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken,
			@RequestHeader(ACTION_HEADER) String action) {
		requireAction(action, "refresh");
		Optional<AuthService.AuthSession> session = authService.refresh(refreshToken);
		if (session.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
					.build();
		}

		AuthService.AuthSession refreshedSession = session.get();
		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, refreshCookie(refreshedSession.refreshToken()).toString())
				.body(refreshedSession.response());
	}

	@PostMapping(ApiPaths.AUTH_LOGOUT)
	public ResponseEntity<Void> logout(
			@CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken,
			@RequestHeader(ACTION_HEADER) String action) {
		requireAction(action, "logout");
		authService.logout(refreshToken);
		return ResponseEntity.noContent()
				.header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
				.build();
	}

	private ResponseCookie refreshCookie(String token) {
		return ResponseCookie.from(REFRESH_COOKIE, token)
				.httpOnly(true)
				.secure(secureRefreshCookie)
				.sameSite("Strict")
				.path(authCookiePath())
				.maxAge(refreshTokenExpiration)
				.build();
	}

	private ResponseCookie clearRefreshCookie() {
		return ResponseCookie.from(REFRESH_COOKIE, "")
				.httpOnly(true)
				.secure(secureRefreshCookie)
				.sameSite("Strict")
				.path(authCookiePath())
				.maxAge(Duration.ZERO)
				.build();
	}

	private String authCookiePath() {
		return servletContext.getContextPath() + ApiPaths.AUTH_BASE;
	}

	private void requireAction(String actual, String expected) {
		if (!expected.equals(actual)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid auth request.");
		}
	}
}
