package com.carrental.backend.auth.security;

import com.carrental.backend.entity.Role;

public record AuthenticatedUser(Long userId, Role role) {
}