package com.interviewTrainer.userService.config;



import com.interviewTrainer.userService.entity.Role;
import com.interviewTrainer.userService.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.resource.OAuth2ResourceServerConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {
    @Autowired
    private final UserService userService;
    @Autowired
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println();
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(exchange ->
                        exchange
                                .requestMatchers("/api/v1/user/signup","/api/v1/user/signin","/api/v1/user/refresh-token","/api/v1/user/load-user-by-email/**","/api/v1/user/load-user-by-emailE/**","/api/v1/user/upload","/api/v1/user/public/get-interviewers","/api/v1/user/public/get-user-by-id/**","api/v1/user/get-users-by-ids/**","/api/v1/user/get-user/**","/api/v1/user/update-score/**","/api/v1/user").permitAll()
                                .requestMatchers("/api/v1/user/online-status/**","/api/v1/user/get-user-by-id/**","/api/v1/user/update-user/**","/api/v1/user/get-user-id/**").hasAnyAuthority(Role.USER.name())
                                .requestMatchers("/api/v1/user/**").hasAnyAuthority(Role.ADMIN.name())
                                .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authenticationProvider=new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userService.userDetailsService());
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        System.out.println("apepedpe"+userService.userDetailsService());
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