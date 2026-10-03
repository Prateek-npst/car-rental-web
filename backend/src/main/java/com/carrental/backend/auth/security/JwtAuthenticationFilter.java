package com.carrental.backend.auth.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtService jwtService;
	private final SecurityErrorHandler securityErrorHandler;

	public JwtAuthenticationFilter(JwtService jwtService, SecurityErrorHandler securityErrorHandler) {
		this.jwtService = jwtService;
		this.securityErrorHandler = securityErrorHandler;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String authorization = request.getHeader("Authorization");
		if (authorization == null || !authorization.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		AuthenticatedUser user;
		try {
			user = jwtService.parseToken(authorization.substring(7).trim());
		} catch (JwtException | IllegalArgumentException exception) {
			SecurityContextHolder.clearContext();
			securityErrorHandler.commence(request, response, new BadCredentialsException("Invalid bearer token."));
			return;
		}

		var authentication = new UsernamePasswordAuthenticationToken(
				user,
				null,
				List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name())));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		filterChain.doFilter(request, response);
	}
}