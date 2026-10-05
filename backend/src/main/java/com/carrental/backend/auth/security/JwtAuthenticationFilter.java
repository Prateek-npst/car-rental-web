package com.carrental.backend.auth.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.carrental.backend.constants.SecurityConstants;

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
		String authorization = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);
		if (authorization == null || !authorization.startsWith(SecurityConstants.BEARER_PREFIX)) {
			filterChain.doFilter(request, response);
			return;
		}

		AuthenticatedUser user;
		try {
			user = jwtService.parseToken(authorization.substring(SecurityConstants.BEARER_PREFIX.length()).trim());
		} catch (JwtException | IllegalArgumentException exception) {
			SecurityContextHolder.clearContext();
			securityErrorHandler.commence(request, response, new BadCredentialsException("Invalid bearer token."));
			return;
		}

		var authentication = new UsernamePasswordAuthenticationToken(
				user,
				null,
				List.of(new SimpleGrantedAuthority(SecurityConstants.ROLE_PREFIX + user.role().name())));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		filterChain.doFilter(request, response);
	}
}