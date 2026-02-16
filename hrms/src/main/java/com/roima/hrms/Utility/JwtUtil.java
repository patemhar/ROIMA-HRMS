package com.roima.hrms.Utility;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${secretKey}")
    private String secretKey;

    // Access token validity 15 min
    private static final long ACCESS_TOKEN_VALIDITY =
            15 * 60 * 1000;

    // Refresh token validity 7 days
    private static final long REFRESH_TOKEN_VALIDITY =
            7 * 24 * 60 * 60 * 1000L;

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }


    public String generateAccessToken(UserDetails user) {

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim(
                        "role",
                        user.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                )
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis()
                                + ACCESS_TOKEN_VALIDITY)
                )
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String generateRefreshToken(UserDetails user) {

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis()
                                + REFRESH_TOKEN_VALIDITY)
                )
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractTokenType(String token) {
        return (String) extractAllClaims(token).get("type");
    }

    private Claims extractAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Validation

    public boolean validateToken(
            String token,
            UserDetails userDetails
    ) {

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    public boolean validateRefreshToken(
            String token,
            UserDetails userDetails
    ) {

        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {

        Date expiry =
                extractAllClaims(token).getExpiration();

        return expiry.before(new Date());
    }
}
