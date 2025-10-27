package com.interviewTrainer.apiGateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {


    public static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";


    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 🔹 Check if token is invalid (Expired or Tampered)
    public boolean isInvalid(String token) {
        try {
            if(!isTokenExpired(token)){
            getAllClaimsFromToken(token);
            return false;
            }else {
                return true;}// Valid Token
        } catch (Exception e) {
            return true; // Invalid Token
        }
    }

    // 🔹 Extract the email from the JWT token

    // 🔹 Extract a specific claim from token

    // 🔹 Check if the token is expired
    public boolean isTokenExpired(String token) {
        return getAllClaimsFromToken(token).getExpiration().before(new Date());
    }





    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
