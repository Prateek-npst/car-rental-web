package com.carrental.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.carrental.backend.auth.security.AuthenticatedUser;
import com.carrental.backend.auth.security.JwtProperties;
import com.carrental.backend.auth.security.JwtService;
import com.carrental.backend.entity.Booking;
import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;
import com.carrental.backend.entity.Vehicle;
import com.carrental.backend.repository.BookingRepository;
import com.carrental.backend.repository.UserRepository;
import com.carrental.backend.repository.VehicleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(AuthSecurityIntegrationTests.AdminOnlyTestController.class)
class AuthSecurityIntegrationTests {
	private static final String API = "/api";
	private static final String PASSWORD = "secure-password-123";

	@LocalServerPort
	private int port;

	private final HttpClient httpClient = HttpClient.newHttpClient();

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private VehicleRepository vehicleRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private JwtProperties jwtProperties;

	private final ObjectMapper objectMapper = new ObjectMapper();

	private Vehicle vehicle;

	@BeforeEach
	void prepareDatabase() {
		bookingRepository.deleteAll();
		vehicleRepository.deleteAll();
		userRepository.deleteAll();
		vehicle = vehicleRepository.save(
				new Vehicle("TEST-101", "Test Compact", new BigDecimal("50.00"), "Central City"));
	}

	@Test
	void registrationCreatesUserWithBcryptHashAndDoesNotAcceptAdminRole() throws Exception {
	HttpResponse<String> response = post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, "ADMIN"));

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(response.body()).contains("\"role\":\"USER\"")
				.doesNotContain("password", "secure-password-123", "$2a$", "$2b$");

		User savedUser = userRepository.findByEmailIgnoreCase("renter@example.com").orElseThrow();
		assertThat(savedUser.getRole()).isEqualTo(Role.USER);
		assertThat(savedUser.getPassword()).startsWith("$2");
		assertThat(passwordEncoder.matches(PASSWORD, savedUser.getPassword())).isTrue();

		HttpResponse<String> duplicate = post("/auth/register", registerBody("Renter", "RENTER@example.com", PASSWORD, null));
		assertThat(duplicate.statusCode()).isEqualTo(409);
	}

	@Test
	void loginIsPublicAndReturnsSignedJwtWithUserIdentityAndRole() throws Exception {
		assertThat(post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null))
				.statusCode()).isEqualTo(201);

		HttpResponse<String> response = post("/auth/login", Map.of("email", "RENTER@example.com", "password", PASSWORD));
		assertThat(response.statusCode()).isEqualTo(200);

		JsonNode body = objectMapper.readTree(response.body());
		String token = body.get("token").asText();
		assertThat(token.split("\\.")).hasSize(3);
		assertThat(body.get("tokenType").asText()).isEqualTo("Bearer");
		assertThat(response.body()).doesNotContain("password", "$2a$", "$2b$");

		AuthenticatedUser claims = jwtService.parseToken(token);
		assertThat(claims.role()).isEqualTo(Role.USER);
		assertThat(userRepository.findByEmailIgnoreCase("renter@example.com").orElseThrow().getId())
				.isEqualTo(claims.userId());

		HttpResponse<String> invalid = post("/auth/login", Map.of("email", "renter@example.com", "password", "wrong-password"));
		assertThat(invalid.statusCode()).isEqualTo(401);
		HttpResponse<String> shortInvalid = post("/auth/login", Map.of("email", "renter@example.com", "password", "x"));
		assertThat(shortInvalid.statusCode()).isEqualTo(401);
	}

	@Test
	void vehicleApiRejectsMissingInvalidAndExpiredTokens() throws Exception {
		assertThat(get("/vehicles", null).statusCode()).isEqualTo(401);
		assertThat(get("/vehicles", "not-a-jwt").statusCode()).isEqualTo(401);

		HttpResponse<String> registration = post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		Long userId = objectMapper.readTree(registration.body()).get("id").asLong();
		assertThat(get("/vehicles", expiredToken(userId)).statusCode()).isEqualTo(401);
	}

	@Test
	void validUserJwtAccessesProtectedVehicleEndpoint() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		String token = loginToken("renter@example.com", PASSWORD);

		HttpResponse<String> response = get("/vehicles", token);
		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("TEST-101");
	}

	@Test
	void userAndAdminAuthoritiesAreEnforced() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		String userToken = loginToken("renter@example.com", PASSWORD);
		assertThat(get("/test/admin", userToken).statusCode()).isEqualTo(403);

		userRepository.save(new User("Admin", "admin@example.com", passwordEncoder.encode(PASSWORD), Role.ADMIN));
		String adminToken = loginToken("admin@example.com", PASSWORD);
		assertThat(get("/test/admin", adminToken).statusCode()).isEqualTo(200);
	}

	@Test
	void bookingRejectsAnotherUsersIdAndUsesAuthenticatedOwner() throws Exception {
		HttpResponse<String> registration = post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		Long authenticatedUserId = objectMapper.readTree(registration.body()).get("id").asLong();
		String token = loginToken("renter@example.com", PASSWORD);

		Map<String, Object> mismatchedRequest = bookingBody(999999L);
		assertThat(post("/bookings", mismatchedRequest, token).statusCode()).isEqualTo(403);

		HttpResponse<String> created = post("/bookings", bookingBody(authenticatedUserId), token);
		assertThat(created.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(created.body()).get("userId").asLong()).isEqualTo(authenticatedUserId);
		Booking savedBooking = bookingRepository.findAll().getFirst();
		assertThat(savedBooking.getUser().getId()).isEqualTo(authenticatedUserId);
	}

	private String loginToken(String email, String password) throws Exception {
		HttpResponse<String> response = post("/auth/login", Map.of("email", email, "password", password));
		assertThat(response.statusCode()).isEqualTo(200);
		return objectMapper.readTree(response.body()).get("token").asText();
	}

	private HttpResponse<String> post(String path, Object body) throws Exception {
		return post(path, body, null);
	}

	private HttpResponse<String> post(String path, Object body, String token) throws Exception {
		HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url(path)))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)));
		if (token != null) {
			request.header("Authorization", "Bearer " + token);
		}
		return httpClient.send(request.build(), HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> get(String path, String token) throws Exception {
		HttpRequest.Builder request = HttpRequest.newBuilder(URI.create(url(path))).GET();
		if (token != null) {
			request.header("Authorization", "Bearer " + token);
		}
		return httpClient.send(request.build(), HttpResponse.BodyHandlers.ofString());
	}

	private String url(String path) {
		return "http://localhost:" + port + API + path;
	}

	private Map<String, Object> registerBody(String name, String email, String password, String role) {
		if (role == null) {
			return Map.of("name", name, "email", email, "password", password);
		}
		return Map.of("name", name, "email", email, "password", password, "role", role);
	}

	private Map<String, Object> bookingBody(Long userId) {
		return Map.of(
				"userId", userId,
				"vehicleId", vehicle.getId(),
				"startDate", "2026-11-01",
				"endDate", "2026-11-03");
	}

	private String expiredToken(Long userId) {
		SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.getSecret()));
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(userId.toString())
				.claim("role", Role.USER.name())
				.issuedAt(Date.from(now.minusSeconds(120)))
				.expiration(Date.from(now.minusSeconds(60)))
				.signWith(key)
				.compact();
	}

	@RestController
	static class AdminOnlyTestController {
		@GetMapping("/test/admin")
		@PreAuthorize("hasRole('ADMIN')")
		public String adminOnly() {
			return "admin";
		}
	}
}
