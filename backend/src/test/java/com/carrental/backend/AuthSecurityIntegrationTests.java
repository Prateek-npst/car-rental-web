package com.carrental.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.HashMap;
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
	void authenticatedAdminCanListVehicles() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);

		HttpResponse<String> response = get("/vehicles", loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("TEST-101", "Test Compact")
				.doesNotContain("password", "$2a$", "$2b$");
	}

	@Test
	void adminCanCreateVehicle() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);
		Map<String, Object> request = vehicleBody("NEW-202", "New Sedan", "85.50", "West End");

		HttpResponse<String> response = post("/vehicles", request, loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(response.body()).contains("NEW-202", "New Sedan", "West End")
				.doesNotContain("password", "$2a$", "$2b$");
		assertThat(vehicleRepository.existsByRegNumber("NEW-202")).isTrue();
	}

	@Test
	void userCannotCreateVehicle() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));

		HttpResponse<String> response = post(
				"/vehicles", vehicleBody("NEW-202", "New Sedan", "85.50", "West End"),
				loginToken("renter@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(403);
		assertThat(vehicleRepository.count()).isEqualTo(1);
	}

	@Test
	void adminCanUpdateVehicle() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);

		HttpResponse<String> response = put(
				"/vehicles/" + vehicle.getId(),
				vehicleBody("TEST-202", "Updated Sedan", "99.50", "North Harbor"),
				loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(response.body()).contains("TEST-202", "Updated Sedan", "North Harbor");
		assertThat(vehicleRepository.findById(vehicle.getId()).orElseThrow().getModel()).isEqualTo("Updated Sedan");
	}

	@Test
	void userCannotUpdateVehicle() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));

		HttpResponse<String> response = put(
				"/vehicles/" + vehicle.getId(),
				vehicleBody("TEST-202", "Updated Sedan", "99.50", "North Harbor"),
				loginToken("renter@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(403);
		assertThat(vehicleRepository.findById(vehicle.getId()).orElseThrow().getModel()).isEqualTo("Test Compact");
	}

	@Test
	void adminCanDeleteVehicle() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);

		HttpResponse<String> response = delete(
				"/vehicles/" + vehicle.getId(), loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(204);
		assertThat(vehicleRepository.findById(vehicle.getId())).isEmpty();
	}

	@Test
	void userCannotDeleteVehicle() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));

		HttpResponse<String> response = delete(
				"/vehicles/" + vehicle.getId(), loginToken("renter@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(403);
		assertThat(vehicleRepository.findById(vehicle.getId())).isPresent();
	}

	@Test
	void vehicleUpdateAndDeleteReturnNotFoundWhenVehicleIsMissing() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);
		String token = loginToken("admin@example.com", PASSWORD);

		assertThat(put("/vehicles/999999", vehicleBody("NEW-202", "New Sedan", "85.50", "West End"), token)
				.statusCode()).isEqualTo(404);
		assertThat(delete("/vehicles/999999", token).statusCode()).isEqualTo(404);
	}

	@Test
	void invalidVehicleDataIsRejected() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);
		Map<String, Object> request = vehicleBody("NEW-202", "New Sedan", "100000.01", "West End");

		assertThat(post("/vehicles", request, loginToken("admin@example.com", PASSWORD)).statusCode())
				.isEqualTo(400);
		assertThat(vehicleRepository.count()).isEqualTo(1);
	}

	@Test
	void duplicateVehicleRegistrationNumberIsRejectedIgnoringCase() throws Exception {
		saveUser("Admin", "admin@example.com", Role.ADMIN);

		HttpResponse<String> response = post(
				"/vehicles", vehicleBody("test-101", "Duplicate", "65.00", "Central City"),
				loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(409);
		assertThat(vehicleRepository.count()).isEqualTo(1);
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
	void authenticatedUserCanBookWithoutUserIdAndJwtDeterminesOwner() throws Exception {
		HttpResponse<String> registration = post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		Long authenticatedUserId = objectMapper.readTree(registration.body()).get("id").asLong();
		String token = loginToken("renter@example.com", PASSWORD);

		HttpResponse<String> created = post("/bookings", bookingBody(), token);
		assertThat(created.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(created.body()).get("userId").asLong()).isEqualTo(authenticatedUserId);
		Booking savedBooking = bookingRepository.findAll().getFirst();
		assertThat(savedBooking.getUser().getId()).isEqualTo(authenticatedUserId);
	}

	@Test
	void clientSuppliedUserIdDoesNotChangeBookingOwner() throws Exception {
		HttpResponse<String> registration = post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		Long authenticatedUserId = objectMapper.readTree(registration.body()).get("id").asLong();
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> request = bookingBody();
		request.put("userId", 999999L);

		HttpResponse<String> created = post("/bookings", request, token);
		assertThat(created.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(created.body()).get("userId").asLong()).isEqualTo(authenticatedUserId);
		assertThat(bookingRepository.findAll().getFirst().getUser().getId()).isEqualTo(authenticatedUserId);
	}

	@Test
	void authenticatedAdminCanCreateBookingWithoutUserId() throws Exception {
		User admin = userRepository.save(
				new User("Admin", "admin@example.com", passwordEncoder.encode(PASSWORD), Role.ADMIN));
		String token = loginToken("admin@example.com", PASSWORD);

		HttpResponse<String> created = post("/bookings", bookingBody(), token);

		assertThat(created.statusCode()).isEqualTo(201);
		assertThat(objectMapper.readTree(created.body()).get("userId").asLong()).isEqualTo(admin.getId());
		assertThat(bookingRepository.findAll().getFirst().getUser().getId()).isEqualTo(admin.getId());
		assertThat(created.body()).doesNotContain("password", "$2a$", "$2b$");
	}

	@Test
	void bookingRequiresAuthentication() throws Exception {
		assertThat(post("/bookings", bookingBody()).statusCode()).isEqualTo(401);
		assertThat(get("/bookings", null).statusCode()).isEqualTo(401);
	}

	@Test
	void userReceivesOnlyTheirOwnBookingsWithSafeVehicleDetails() throws Exception {
		User renter = saveUser("Renter", "renter@example.com", Role.USER);
		User otherRenter = saveUser("Other Renter", "other@example.com", Role.USER);
		bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		bookingRepository.save(new Booking(otherRenter, vehicle,
				java.time.LocalDate.parse("2026-11-05"), java.time.LocalDate.parse("2026-11-07")));
		String token = loginToken("renter@example.com", PASSWORD);

		HttpResponse<String> response = get("/bookings", token);
		JsonNode bookings = objectMapper.readTree(response.body());

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(bookings.size()).isEqualTo(1);
		assertThat(bookings.get(0).get("userId").asLong()).isEqualTo(renter.getId());
		assertThat(bookings.get(0).get("vehicle").get("model").asText()).isEqualTo("Test Compact");
		assertThat(bookings.get(0).get("vehicle").get("location").asText()).isEqualTo("Central City");
		assertThat(response.body()).doesNotContain("password", "$2a$", "$2b$");
	}

	@Test
	void adminReceivesAllBookings() throws Exception {
		User renter = saveUser("Renter", "renter@example.com", Role.USER);
		User otherRenter = saveUser("Other Renter", "other@example.com", Role.USER);
		saveUser("Admin", "admin@example.com", Role.ADMIN);
		bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		bookingRepository.save(new Booking(otherRenter, vehicle,
				java.time.LocalDate.parse("2026-11-05"), java.time.LocalDate.parse("2026-11-07")));

		HttpResponse<String> response = get("/bookings", loginToken("admin@example.com", PASSWORD));

		assertThat(response.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(response.body()).size()).isEqualTo(2);
	}

	@Test
	void userCanUpdateAndDeleteTheirOwnBooking() throws Exception {
		User renter = saveUser("Renter", "renter@example.com", Role.USER);
		Booking booking = bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> update = bookingBody();
		update.put("startDate", "2026-11-05");
		update.put("endDate", "2026-11-07");

		HttpResponse<String> updated = put("/bookings/" + booking.getId(), update, token);
		assertThat(updated.statusCode()).isEqualTo(200);
		assertThat(objectMapper.readTree(updated.body()).get("startDate").asText()).isEqualTo("2026-11-05");

		assertThat(delete("/bookings/" + booking.getId(), token).statusCode()).isEqualTo(204);
		assertThat(bookingRepository.findById(booking.getId())).isEmpty();
	}

	@Test
	void userCannotUpdateOrDeleteAnotherUsersBooking() throws Exception {
		User owner = saveUser("Owner", "owner@example.com", Role.USER);
		saveUser("Renter", "renter@example.com", Role.USER);
		Booking booking = bookingRepository.save(new Booking(owner, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		String renterToken = loginToken("renter@example.com", PASSWORD);

		assertThat(put("/bookings/" + booking.getId(), bookingBody(), renterToken).statusCode()).isEqualTo(403);
		assertThat(delete("/bookings/" + booking.getId(), renterToken).statusCode()).isEqualTo(403);
		assertThat(bookingRepository.findById(booking.getId())).isPresent();
	}

	@Test
	void adminCanUpdateAndDeleteAnotherUsersBooking() throws Exception {
		User owner = saveUser("Owner", "owner@example.com", Role.USER);
		saveUser("Admin", "admin@example.com", Role.ADMIN);
		Booking booking = bookingRepository.save(new Booking(owner, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		String adminToken = loginToken("admin@example.com", PASSWORD);
		Map<String, Object> update = bookingBody();
		update.put("startDate", "2026-11-05");
		update.put("endDate", "2026-11-07");

		assertThat(put("/bookings/" + booking.getId(), update, adminToken).statusCode()).isEqualTo(200);
		assertThat(delete("/bookings/" + booking.getId(), adminToken).statusCode()).isEqualTo(204);
		assertThat(bookingRepository.findById(booking.getId())).isEmpty();
	}

	@Test
	void bookingUpdateRejectsInclusiveBoundaryConflictButAllowsTheNextDay() throws Exception {
		User renter = saveUser("Renter", "renter@example.com", Role.USER);
		User otherRenter = saveUser("Other Renter", "other@example.com", Role.USER);
		Booking target = bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		bookingRepository.save(new Booking(otherRenter, vehicle,
				java.time.LocalDate.parse("2026-11-04"), java.time.LocalDate.parse("2026-11-06")));
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> boundaryUpdate = bookingBody();
		boundaryUpdate.put("startDate", "2026-11-06");
		boundaryUpdate.put("endDate", "2026-11-08");

		assertThat(put("/bookings/" + target.getId(), boundaryUpdate, token).statusCode()).isEqualTo(409);

		Map<String, Object> followingDayUpdate = bookingBody();
		followingDayUpdate.put("startDate", "2026-11-07");
		followingDayUpdate.put("endDate", "2026-11-09");
		assertThat(put("/bookings/" + target.getId(), followingDayUpdate, token).statusCode()).isEqualTo(200);
	}

	@Test
	void bookingReturnsNotFoundForUnknownVehicle() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> request = bookingBody();
		request.put("vehicleId", 999999L);

		assertThat(post("/bookings", request, token).statusCode()).isEqualTo(404);
	}

	@Test
	void bookingRejectsInvalidDateRange() throws Exception {
		post("/auth/register", registerBody("Renter", "renter@example.com", PASSWORD, null));
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> request = bookingBody();
		request.put("startDate", "2026-11-03");
		request.put("endDate", "2026-11-03");

		assertThat(post("/bookings", request, token).statusCode()).isEqualTo(400);
	}

	@Test
	void adminCannotCreateOverlappingBooking() throws Exception {
		User renter = userRepository.save(
				new User("Renter", "renter@example.com", passwordEncoder.encode(PASSWORD), Role.USER));
		userRepository.save(
				new User("Admin", "admin@example.com", passwordEncoder.encode(PASSWORD), Role.ADMIN));
		bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		String adminToken = loginToken("admin@example.com", PASSWORD);
		Map<String, Object> request = bookingBody();
		request.put("startDate", "2026-11-02");
		request.put("endDate", "2026-11-04");

		assertThat(post("/bookings", request, adminToken).statusCode()).isEqualTo(409);
		assertThat(bookingRepository.findAll()).hasSize(1);
	}

	@Test
	void bookingTreatsSharedBoundaryDatesAsOverlappingButAllowsFollowingDay() throws Exception {
		User renter = userRepository.save(
				new User("Renter", "renter@example.com", passwordEncoder.encode(PASSWORD), Role.USER));
		bookingRepository.save(new Booking(renter, vehicle,
				java.time.LocalDate.parse("2026-11-01"), java.time.LocalDate.parse("2026-11-03")));
		String token = loginToken("renter@example.com", PASSWORD);
		Map<String, Object> boundaryRequest = bookingBody();
		boundaryRequest.put("startDate", "2026-11-03");
		boundaryRequest.put("endDate", "2026-11-05");

		assertThat(post("/bookings", boundaryRequest, token).statusCode()).isEqualTo(409);

		Map<String, Object> followingDayRequest = bookingBody();
		followingDayRequest.put("startDate", "2026-11-04");
		followingDayRequest.put("endDate", "2026-11-06");
		assertThat(post("/bookings", followingDayRequest, token).statusCode()).isEqualTo(201);
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

	private HttpResponse<String> put(String path, Object body, String token) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create(url(path)))
				.header("Content-Type", "application/json")
				.header("Authorization", "Bearer " + token)
				.PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
				.build();
		return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> delete(String path, String token) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create(url(path)))
				.header("Authorization", "Bearer " + token)
				.DELETE()
				.build();
		return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
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

	private User saveUser(String name, String email, Role role) {
		return userRepository.save(new User(name, email, passwordEncoder.encode(PASSWORD), role));
	}

	private Map<String, Object> bookingBody() {
		return new HashMap<>(Map.of(
				"vehicleId", vehicle.getId(),
				"startDate", "2026-11-01",
				"endDate", "2026-11-03"));
	}

	private Map<String, Object> vehicleBody(String regNumber, String model, String dailyRate, String location) {
		return Map.of(
				"regNumber", regNumber,
				"model", model,
				"dailyRate", dailyRate,
				"location", location);
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
