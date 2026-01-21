package com.siteduyuru.guvenlik;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        @Autowired
        private JwtUtil jwtUtil;

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {

                String path = request.getServletPath();

                // 🔴 FORM LOGIN ve STATIK KAYNAKLAR JWT'DEN MUAF
                if (path.equals("/login")
                                || path.equals("/giris")
                                || path.startsWith("/css/")
                                || path.startsWith("/js/")
                                || path.startsWith("/images/")
                                || path.startsWith("/webjars/")
                                || path.startsWith("/h2-console")) {

                        filterChain.doFilter(request, response);
                        return;
                }

                String authHeader = request.getHeader("Authorization");

                if (authHeader != null && authHeader.startsWith("Bearer ")) {

                        String token = authHeader.substring(7);

                        if (jwtUtil.validateToken(token)
                                        && SecurityContextHolder.getContext().getAuthentication() == null) {

                                String username = jwtUtil.getUsernameFromToken(token);
                                String role = jwtUtil.getRoleFromToken(token);

                                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                username,
                                                null,
                                                Collections.singletonList(
                                                                new SimpleGrantedAuthority("ROLE_" + role)));

                                authentication.setDetails(
                                                new WebAuthenticationDetailsSource().buildDetails(request));

                                SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                }

                filterChain.doFilter(request, response);
        }
}
