package com.interviewTrainer.processingService.config;


import com.interviewTrainer.processingService.feignClients.UserClient;
import com.interviewTrainer.processingService.requests.UserResponseDTO;
import com.interviewTrainer.processingService.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    Logger log= LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    @Autowired
    private UserService userService;
    @Autowired
    private JwtTokenProvider tokenProvider;
    private static final Set<String> ALLOWED_SERVICES = Set.of("apiGateway", "authService");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException, IOException {
        System.out.println(request.getHeader("Service"));

//        String serviceHeader = request.getHeader("Service");
//        if (!ALLOWED_SERVICES.contains(serviceHeader)) {
//            log.warn("Unauthorized service access attempt: {}", serviceHeader);
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.getWriter().write("Unauthorized service");
//            return;
//        }

        try {
            String jwt = getJwtFromRequest(request);
            System.out.println("jwt found" + jwt);
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.extractUserName(jwt);
                String userId=tokenProvider.extractUserId(jwt);
                UserDetails userDetails = userService.userDetailsService().loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                request.setAttribute("userId",userId);
                request.setAttribute("username",username);

            }

        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
    private void handleAuthenticationFailure() throws IOException {
        throw new RuntimeException("Invalid Service");
    }
}
