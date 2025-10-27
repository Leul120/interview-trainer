package com.interviewTrainer.userService.services.impl;


import com.interviewTrainer.userService.entity.*;
import com.interviewTrainer.userService.repositories.UserRepository;
import com.interviewTrainer.userService.requests.JwtAuthenticationRequest;
import com.interviewTrainer.userService.requests.RefreshTokenRequest;
import com.interviewTrainer.userService.requests.SignInRequest;
import com.interviewTrainer.userService.requests.SignUpRequest;
import com.interviewTrainer.userService.services.AuthenticationService;
import com.interviewTrainer.userService.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private  final PasswordEncoder passwordEncoder;
    @Autowired
    private  AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    @Autowired
    public AuthenticationServiceImpl(UserRepository userRepository,PasswordEncoder passwordEncoder,JwtService jwtService){
        this.userRepository=userRepository;
//        this.authenticationManager=authenticationManager;
        this.passwordEncoder=passwordEncoder;
        this.jwtService=jwtService;
    }
    @Override
    public JwtAuthenticationRequest signup(SignUpRequest signUpRequest) {
        Optional<User> oldUser=userRepository.findByEmail(signUpRequest.getEmail());
        System.out.println(oldUser);
        if(oldUser.isEmpty()) {
            User user = new User();
            user.setName(signUpRequest.getName());
            user.setEmail(signUpRequest.getEmail());
            user.setRole(Role.USER);
            user.setBiography(signUpRequest.getBiography());
            user.setAvailabilityStatus(AvailabilityStatus.UNAVAILABLE);
            user.setExpertise(signUpRequest.getExpertise());
            System.out.println("Received Awards: " + signUpRequest.getAwards());

            List<Award> awards = signUpRequest.getAwards();
            if (awards != null) {
                for (Award award : awards) {
                    award.setUser(user);

                }
            }
            user.setAwards(awards);
            System.out.println("Received Experiences: " + signUpRequest.getExperiences());

            List<Experience> experiences = signUpRequest.getExperiences();
            if (experiences != null) {
                for (Experience experience : experiences) {
                    experience.setUser(user);
                }
            }
            user.setExperiences(experiences);
            user.setIndustry(signUpRequest.getIndustry());
            user.setProfilePicture(signUpRequest.getProfilePicture());
            user.setType(signUpRequest.getType());
            user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            User savedUser= userRepository.save(user);
            String jwt;
            String refreshToken;
            try{
                jwt=jwtService.generateToken(savedUser);
                refreshToken=jwtService.generateRefreshToken(savedUser);
            }catch (Exception e){
                throw new RuntimeException("Token generation failed");
            }
            JwtAuthenticationRequest jwtAuthenticationRequest=new JwtAuthenticationRequest();
            jwtAuthenticationRequest.setToken(jwt);
            jwtAuthenticationRequest.setRefreshToken(refreshToken);
            return jwtAuthenticationRequest;
        }else{
            throw new IllegalArgumentException("user already exists!");
        }
    }

    @Override
    public JwtAuthenticationRequest signIn(SignInRequest signInRequest) {
        System.out.println(signInRequest);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signInRequest.getEmail(),signInRequest.getPassword())
            );
        } catch (AuthenticationException e) {
            System.out.println(e.getMessage());
            throw new RuntimeException(e);
        }
        User user=userRepository.findByEmail(signInRequest.getEmail()).orElseThrow(()->new IllegalArgumentException("User not found"));
        String jwt;
        String refreshToken;

        try {
            jwt=jwtService.generateToken(user);
            refreshToken=jwtService.generateRefreshToken(user);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        JwtAuthenticationRequest jwtAuthenticationRequest=new JwtAuthenticationRequest();
        jwtAuthenticationRequest.setToken(jwt);
        jwtAuthenticationRequest.setRefreshToken(refreshToken);
        return jwtAuthenticationRequest;
    }

    @Override
    public JwtAuthenticationRequest refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String userEmail=jwtService.extractUserName(refreshTokenRequest.getToken());
        User user=userRepository.findByEmail(userEmail).orElseThrow(()->new IllegalArgumentException("User not found!"));
        if(jwtService.isTokenValid(refreshTokenRequest.getToken(), user)){
            var jwt=jwtService.generateRefreshToken(user);
            JwtAuthenticationRequest jwtAuthenticationRequest=new JwtAuthenticationRequest();
            jwtAuthenticationRequest.setToken(jwt);
            jwtAuthenticationRequest.setRefreshToken(refreshTokenRequest.getToken());
            return jwtAuthenticationRequest;
        }
        return null;
    }
}
