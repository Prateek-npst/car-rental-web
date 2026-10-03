package com.carrental.backend.auth.security;

import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.carrental.backend.entity.Role;
import com.carrental.backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	private final SecretKey signingKey;
	private final long expirationMillis;

	public JwtService(JwtProperties properties) {
		byte[] keyBytes = Decoders.BASE64.decode(properties.getSecret());
		if (keyBytes.length < 32) {
			throw new IllegalStateException("JWT secret must decode to at least 256 bits.");
		}
		if (properties.getExpiration() == null || properties.getExpiration().isZero()
				|| properties.getExpiration().isNegative()) {
			throw new IllegalStateException("JWT expiration must be a positive duration.");
		}

		this.signingKey = Keys.hmacShaKeyFor(keyBytes);
		this.expirationMillis = properties.getExpiration().toMillis();
	}

	public String generateToken(User user) {
		Instant issuedAt = Instant.now();
		return Jwts.builder()
				.subject(user.getId().toString())
				.claim("role", user.getRole().name())
				.issuedAt(Date.from(issuedAt))
				.expiration(Date.from(issuedAt.plusMillis(expirationMillis)))
				.signWith(signingKey)
				.compact();
	}

	public AuthenticatedUser parseToken(String token) {
		Claims claims = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
		String subject = claims.getSubject();
		Object roleClaim = claims.get("role");
		if (subject == null || subject.isBlank() || !(roleClaim instanceof String roleName)) {
			throw new IllegalArgumentException("Required JWT claims are missing.");
		}
		long userId = Long.parseLong(subject);
		if (userId < 1) {
			throw new IllegalArgumentException("JWT subject is invalid.");
		}
		return new AuthenticatedUser(userId, Role.valueOf(roleName));
	}

	public long getExpirationSeconds() {
		return expirationMillis / 1000;
	}
}