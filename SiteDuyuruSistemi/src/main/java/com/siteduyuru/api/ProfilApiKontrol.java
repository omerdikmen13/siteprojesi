package com.siteduyuru.api;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profil")
public class ProfilApiKontrol {

    private final KullaniciServisi kullaniciServisi;

    public ProfilApiKontrol(KullaniciServisi kullaniciServisi) {
        this.kullaniciServisi = kullaniciServisi;
    }

    @GetMapping
    public ResponseEntity<?> profil(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Giriş yapmanız gerekiyor"
            ));
        }

        // Email ile kullanıcıyı bul
        Kullanici kullanici = kullaniciServisi.emailIleBul(auth.getName());
        
        if (kullanici == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Kullanıcı bulunamadı"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "id", kullanici.getId(),
                        "adSoyad", kullanici.getAdSoyad(),
                        "email", kullanici.getEmail(),
                        "rol", kullanici.getRolu().name()
                )
        ));
    }
}