package com.office.reservation.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "mySecretKeyForJWTTokenGenerationThatIsLongEnough2024OfficeSmart";
    private final long expiration = 3600000;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secret, expiration);
    }

    @Test
    void testGenerateAndValidateToken() {
        String username = "testuser";
        String role = "ROLE_EMPLOYEE";
        
        String token = jwtUtil.generateToken(username, role);
        
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals(username, jwtUtil.getUsernameFromToken(token));
        assertEquals(role, jwtUtil.getRoleFromToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }
}
