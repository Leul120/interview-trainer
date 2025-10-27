package com.interviewTrainer.questionGenerationService.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class JwtTokenProvider {
//    @Value("${jwt.secret}")
    private final String jwtSecret="5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    private <T> T extractClaim(String token, Function<Claims,T> claimsResolvers){
        final Claims claims=extractClaims(token);
        return  claimsResolvers.apply(claims);
    }

    public String extractUserName(String token){
        return extractClaims(token).get("username",String.class);
    }
    public String extractUserId(String token) {
        return extractClaims(token).get("userId",String.class);
    }


    private Claims extractClaims(String token){
        return  Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody();
    }
}
