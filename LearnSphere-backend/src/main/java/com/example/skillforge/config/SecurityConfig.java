package com.example.skillforge.config;

import com.example.skillforge.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
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
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(org.springframework.security.config.Customizer.withDefaults()) // Ensure CORS is applied
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/public/**",
                                "/api/health",
                                "/health",
                                "/api/materials/**",
                                "/api/files/**",
                                "/api/progress/material/complete",
                                "/api/progress/topic/add-time",
                                "/api/progress/topic/complete",
                                "/api/progress/student/**",
                                "/api/adaptive/next-topic",
                                "/api/topics/**",
                                "/api/enrollments/**",
                                "/api/progress/**",
                                "/api/certificates/public/**",
                                "/error")
                        .permitAll() // ALL UNPROTECTED ENDPOINTS HERE

                        .requestMatchers("/api/materials/view-pdf/**").permitAll() // ✅ Allow PDF viewing
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/materials/link").hasAnyAuthority("ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        .requestMatchers("/api/instructor/**").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers("/api/quizzes/**").hasAnyAuthority("ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN")
                        
                        // Analytics
                        .requestMatchers("/api/analytics/student").hasAuthority("ROLE_STUDENT")
                        .requestMatchers("/api/analytics/instructor").hasAuthority("ROLE_INSTRUCTOR")
                        .requestMatchers("/api/analytics/admin").hasAuthority("ROLE_ADMIN")

                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
