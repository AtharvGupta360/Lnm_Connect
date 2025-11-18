package com.miniproject.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stream")
@CrossOrigin(origins = "*")
public class StreamTokenController {

    // Add these to your application.properties:
    // stream.api.key=u3sqaqyp6v8k
    // stream.api.secret=YOUR_STREAM_API_SECRET
    
    @Value("${stream.api.key:u3sqaqyp6v8k}")
    private String streamApiKey;
    
    @Value("${stream.api.secret}")
    private String streamApiSecret;

    @PostMapping("/token")
    public ResponseEntity<?> generateStreamToken(@RequestBody Map<String, Object> request) {
        try {
            String userId = request.get("userId").toString();
            
            // Default validity: 1 hour
            Integer validityInSeconds = request.containsKey("validity") 
                ? (Integer) request.get("validity") 
                : 3600;

            String token = generateToken(userId, validityInSeconds);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("apiKey", streamApiKey);
            response.put("userId", userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate Stream token: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private String generateToken(String userId, int validityInSeconds) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expiration = new Date(nowMillis + (validityInSeconds * 1000L));

        // Create signing key from Stream API secret
        Key signingKey = Keys.hmacShaKeyFor(streamApiSecret.getBytes(StandardCharsets.UTF_8));

        // Build JWT token with Stream-specific claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("user_id", userId);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
