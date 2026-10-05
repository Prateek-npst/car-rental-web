package com.carrental.backend.constants;

public final class ApiPaths {
	public static final String AUTH_BASE = "/auth";
	public static final String AUTH_LOGIN = "/login";
	public static final String AUTH_REGISTER = "/register";
	public static final String AUTH_REFRESH = "/refresh";
	public static final String AUTH_LOGOUT = "/logout";
	public static final String AUTH_LOGIN_FULL = AUTH_BASE + AUTH_LOGIN;
	public static final String AUTH_REGISTER_FULL = AUTH_BASE + AUTH_REGISTER;
	public static final String AUTH_REFRESH_FULL = AUTH_BASE + AUTH_REFRESH;
	public static final String AUTH_LOGOUT_FULL = AUTH_BASE + AUTH_LOGOUT;

	public static final String VEHICLES_BASE = "/vehicles";
	public static final String VEHICLE_SEARCH = "/search";
	public static final String VEHICLE_SEARCH_FULL = VEHICLES_BASE + VEHICLE_SEARCH;

	public static final String BOOKINGS_BASE = "/bookings";

	public static final String H2_CONSOLE = "/h2-console";
	public static final String H2_CONSOLE_ALL = H2_CONSOLE + "/**";

	private ApiPaths() {
	}
}
