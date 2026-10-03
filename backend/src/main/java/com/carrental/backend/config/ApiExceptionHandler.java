package com.carrental.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException exception) {
		String message = exception.getStatusCode().is5xxServerError()
				? "Request failed."
				: exception.getReason();
		return ResponseEntity.status(exception.getStatusCode()).body(new ApiError(message));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
		return ResponseEntity.badRequest().body(new ApiError("Invalid request."));
	}

	public record ApiError(String message) {
	}
}