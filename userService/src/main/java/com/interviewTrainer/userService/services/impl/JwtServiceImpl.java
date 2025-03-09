package com.interviewTrainer.userService.services.impl;


import com.interviewTrainer.userService.entity.User;
import com.interviewTrainer.userService.services.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {


    public String generateToken(User user){
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username",user.getUsername());
        return Jwts.builder().setSubject(user.getEmail())
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*60*24))
                .signWith(getSigninKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateRefreshToken(User user){
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("username",user.getUsername());
        return Jwts.builder().setClaims(claims).setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*24))
                .signWith(getSigninKey(), SignatureAlgorithm.HS256).compact();
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
        return  Jwts.parserBuilder().setSigningKey(getSigninKey()).build().parseClaimsJws(token).getBody();
    }
    private Key getSigninKey(){
        byte[] key= Decoders.BASE64.decode("5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437");
        return Keys.hmacShaKeyFor(key);
    }
    public boolean isTokenValid(String token,UserDetails userDetails){
        final String username=extractUserName(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    private boolean isTokenExpired(String token){
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }


}


