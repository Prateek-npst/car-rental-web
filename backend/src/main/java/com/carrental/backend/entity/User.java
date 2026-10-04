package com.carrental.backend.entity;

import java.util.Objects;

import com.carrental.backend.constants.ValidationLimits;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "app_users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Size(max = ValidationLimits.USER_NAME_MAX_LENGTH)
	@Column(nullable = false, length = ValidationLimits.USER_NAME_MAX_LENGTH)
	private String name;

	@NotBlank
	@Email
	@Size(max = ValidationLimits.USER_EMAIL_MAX_LENGTH)
	@Column(nullable = false, unique = true, length = ValidationLimits.USER_EMAIL_MAX_LENGTH)
	private String email;

	@NotBlank
	@Size(min = ValidationLimits.USER_PASSWORD_MIN_LENGTH, max = ValidationLimits.USER_PASSWORD_MAX_LENGTH)
	@Pattern(regexp = ValidationLimits.USER_PASSWORD_PATTERN,
			message = "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.")
	@Column(nullable = false, length = ValidationLimits.USER_PASSWORD_MAX_LENGTH)
	private String password;

	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;

	protected User() {
	}

	public User(String name, String email, String password, Role role) {
		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@JsonIgnore
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (!(obj instanceof User other)) {
			return false;
		}
		return Objects.equals(id, other.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}