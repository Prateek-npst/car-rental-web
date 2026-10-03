package com.carrental.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.carrental.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
	Optional<User> findByEmailIgnoreCase(String email);

	boolean existsByEmail(String email);
	boolean existsByEmailIgnoreCase(String email);
}