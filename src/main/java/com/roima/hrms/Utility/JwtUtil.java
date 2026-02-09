package com.roima.hrms.Utility;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String secretKey = "kECkEqIeu0SnRsvxT3QLf4GdseO3Oux7fhdghfdhtrcnhrdhjgfcn";

    // Access Token - 30 seconds
    private static final long ACCESS_TOKEN_VALIDITY = 30 * 1000L;

    // Refresh Token - 60 seconds
    private static final long REFRESH_TOKEN_VALIDITY = 60 * 1000L;

    // Generate Access Token (with role)
    public String generateAccessToken(UserDetails user) {

        return Jwts.builder()
                .setSubject((user.getUsername()))
                .claim("role",
                        user.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority())
                        .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Generate Refresh Token (minimal claims)
    public String generateRefreshToken(UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY)
                )
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String extractEmail(String token) {
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

    public boolean validateToken(String token, UserDetails userDetails) {

        String username = extractUsername(token);

        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean validateRefreshToken(String token) {
        return !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {

        Date expiry = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();

        return expiry.before(new Date());
    }
}