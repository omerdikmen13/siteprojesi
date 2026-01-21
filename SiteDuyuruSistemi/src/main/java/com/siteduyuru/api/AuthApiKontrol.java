package com.siteduyuru.api;

import com.siteduyuru.guvenlik.JwtUtil;
import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthApiKontrol {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final KullaniciServisi kullaniciServisi;

    private final PasswordEncoder passwordEncoder;

    public AuthApiKontrol(AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            KullaniciServisi kullaniciServisi,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.kullaniciServisi = kullaniciServisi;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Email ile giriş yap
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getSifre()));

            // Kullanıcıyı email ile bul
            Kullanici kullanici = kullaniciServisi.emailIleBul(request.getEmail());
            if (kullanici == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Kullanıcı bulunamadı"));
            }

            String rol = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_KULLANICI");

            String token = jwtUtil.generateToken(
                    kullanici.getEmail(),
                    rol);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Giriş başarılı!");
            response.put("token", token);
            response.put("kullaniciAdi", kullanici.getAdSoyad()); // Mobilde kullanıcı adı olarak ad soyad göster
            response.put("rol", rol.replace("ROLE_", ""));
            response.put("id", kullanici.getId());
            response.put("adSoyad", kullanici.getAdSoyad());
            response.put("email", kullanici.getEmail());

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Email veya şifre hatalı"));
        }
    }

    // ===== DTO CLASSES =====
    public static class LoginRequest {
        private String email;
        private String sifre;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSifre() {
            return sifre;
        }

        public void setSifre(String sifre) {
            this.sifre = sifre;
        }
    }

}