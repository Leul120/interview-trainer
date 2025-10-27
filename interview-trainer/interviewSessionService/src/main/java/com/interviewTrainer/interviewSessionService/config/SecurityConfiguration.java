package com.interviewTrainer.interviewSessionService.config;




import com.interviewTrainer.interviewSessionService.feignClient.UserClient;
import com.interviewTrainer.interviewSessionService.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {
//    @Autowired
//    private  CustomCorsConfiguration customCorsConfiguration;

    @Autowired
    private UserService userService;
    @Autowired
    private  JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println();
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(exchange ->
                        exchange
                                .requestMatchers("/api/v1/session/get-my-sessions","/ws/**","/api/v1/session").permitAll()
                                .requestMatchers("/api/v1/session/get-my-sessions","/api/v1/session/schedule-interview","/api/v1/session/get-my-scheduled-interviews").hasAnyAuthority("USER")
                                .requestMatchers("/api/v1/user/**").hasAnyAuthority("ADMIN")
                                .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
//                .cors(cors -> cors.configurationSource(customCorsConfiguration)) // Ensure CORS is correct
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authenticationProvider=new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userService.userDetailsService());
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
        return config.getAuthenticationManager();
    }
}