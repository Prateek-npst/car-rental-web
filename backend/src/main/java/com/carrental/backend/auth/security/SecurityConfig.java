package com.carrental.backend.auth.security;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import com.carrental.backend.constants.ApiPaths;
import com.carrental.backend.entity.Role;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, SecurityErrorHandler securityErrorHandler) {
		return new JwtAuthenticationFilter(jwtService, securityErrorHandler);
	}

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtAuthenticationFilter jwtAuthenticationFilter,
			SecurityErrorHandler securityErrorHandler) throws Exception {
		return http
				.cors(cors -> cors.configurationSource(request -> {
					CorsConfiguration configuration = new CorsConfiguration();
					configuration.setAllowedOrigins(List.of(
							"http://localhost:5173",
							"http://127.0.0.1:5173",
							"http://localhost:5174",
							"http://127.0.0.1:5174"));
					configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
					configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Auth-Action"));
					configuration.setAllowCredentials(true);
					return configuration;
				}))
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(securityErrorHandler)
						.accessDeniedHandler(securityErrorHandler))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.POST, ApiPaths.AUTH_REGISTER_FULL, ApiPaths.AUTH_LOGIN_FULL,
								ApiPaths.AUTH_REFRESH_FULL, ApiPaths.AUTH_LOGOUT_FULL).permitAll()
						.requestMatchers(HttpMethod.POST, ApiPaths.VEHICLES_BASE).hasRole(Role.ADMIN.name())
						.requestMatchers(HttpMethod.PUT, ApiPaths.VEHICLES_BASE + "/**").hasRole(Role.ADMIN.name())
						.requestMatchers(HttpMethod.DELETE, ApiPaths.VEHICLES_BASE + "/**").hasRole(Role.ADMIN.name())
						.requestMatchers(HttpMethod.GET, ApiPaths.VEHICLES_BASE, ApiPaths.VEHICLE_SEARCH_FULL).authenticated()
						//we will use this for testing purposes, so we can access the h2 console without authentication
						.requestMatchers(ApiPaths.H2_CONSOLE, ApiPaths.H2_CONSOLE_ALL).permitAll()
						.anyRequest().authenticated())
				.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}
}