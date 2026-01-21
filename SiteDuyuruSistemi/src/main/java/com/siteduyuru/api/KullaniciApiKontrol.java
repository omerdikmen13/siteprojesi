package com.siteduyuru.api;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kullanicilar")
public class KullaniciApiKontrol {

    @Autowired
    private KullaniciServisi kullaniciServisi;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> kullaniciListesi() {
        List<Kullanici> liste = kullaniciServisi.tumKullanicilariGetir();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", liste,
                "count", liste.size()
        ));
    }

    // ⭐ YENİ: KULLANICI DETAY
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> kullaniciDetay(@PathVariable Long id) {
        return kullaniciServisi.idIleKullaniciBul(id)
                .map(k -> ResponseEntity.ok(Map.of("success", true, "data", k)))
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Kullanıcı bulunamadı"
                )));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> kullaniciEkle(@RequestBody Kullanici kullanici) {
        if (kullanici.getSifre() != null) {
            kullanici.setSifre(passwordEncoder.encode(kullanici.getSifre()));
        }
        
        Kullanici kaydedilen = kullaniciServisi.kullaniciKaydet(kullanici);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Kullanıcı eklendi",
                "data", kaydedilen
        ));
    }

    // ⭐ YENİ: KULLANICI SİLME
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> kullaniciSil(@PathVariable Long id) {
        try {
            kullaniciServisi.kullaniciSil(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Kullanıcı silindi"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Kullanıcı silinemedi"
            ));
        }
    }
}