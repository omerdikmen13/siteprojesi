package com.siteduyuru.guvenlik;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class GuvenlikAyar {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Autowired
        private KullaniciDetaylarServisi kullaniciDetaylarServisi;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

                http
                                // CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // CSRF Kapat (REST API ve Form işlemleri için)
                                .csrf(csrf -> csrf.disable())

                                // YETKİLER
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/", "/giris", "/login", "/error").permitAll()
                                                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**")
                                                .permitAll()
                                                .requestMatchers("/api/auth/**", "/api/health").permitAll()
                                                .requestMatchers("/api/gemini/**").permitAll()

                                                // ⭐ SADECE ADMIN'E ÖZEL ALANLAR (Yönetim Paneli)
                                                .requestMatchers(
                                                                "/kullanici/**",
                                                                "/duyurular/yeni", "/duyurular/kaydet",
                                                                "/duyurular/duzenle/**", "/duyurular/sil/**",
                                                                "/aidatlar/yeni", "/aidatlar/kaydet",
                                                                "/aidatlar/sil/**",
                                                                "/harcamalar/yeni", "/harcamalar/kaydet",
                                                                "/harcamalar/sil/**",
                                                                "/sikayetler/liste", "/sikayetler/guncelle/**",
                                                                "/sikayetler/sil/**")
                                                .hasRole("ADMIN")

                                                // ADMIN + KULLANICI
                                                .requestMatchers(
                                                                "/duyurular/liste", "/duyurular/detay/**",
                                                                "/harcamalar/liste",
                                                                "/aidatlar/liste",
                                                                "/odeme/**",
                                                                "/api/sikayet/**",
                                                                "/sikayetler/yeni", "/sikayetler/kaydet",
                                                                "/sikayetler/listem", "/sikayetler/basarili")
                                                .hasAnyRole("ADMIN", "KULLANICI")

                                                .anyRequest().authenticated())

                                // AUTH PROVIDER - BCryptPasswordEncoder kullanması için şart!
                                .authenticationProvider(authenticationProvider())

                                // FORM LOGIN
                                .formLogin(form -> form
                                                .loginPage("/giris")
                                                .loginProcessingUrl("/login")
                                                .defaultSuccessUrl("/", true)
                                                .successHandler((request, response, authentication) -> {
                                                        System.out.println(
                                                                        "LOGIN BASARILI: " + authentication.getName());
                                                        response.sendRedirect("/");
                                                })
                                                .failureHandler((request, response, exception) -> {
                                                        System.out.println("LOGIN HATASI: " + exception.getMessage());
                                                        response.sendRedirect("/giris?error");
                                                })
                                                .permitAll())

                                // LOGOUT
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/giris?logout")
                                                .permitAll())

                                // JWT FILTER
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                                // SESSION
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                                // SECURITY CONTEXT
                                .securityContext(context -> context
                                                .requireExplicitSave(false));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOriginPatterns(Arrays.asList("*"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin",
                                "X-Requested-With", "Cache-Control"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(kullaniciDetaylarServisi);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
