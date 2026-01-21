package com.siteduyuru.api;

import com.siteduyuru.model.SikayetOneri;
import com.siteduyuru.servis.SikayetOneriServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sikayet")
public class SikayetOneriApiKontrol {

    @Autowired
    private SikayetOneriServisi servis;

    @PostMapping("/gonder")
    public ResponseEntity<?> gonder(@RequestBody SikayetOneri sikayetOneri) {
        try {
            SikayetOneri kaydedilen = servis.kaydet(sikayetOneri);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Kaydınız başarıyla alınmıştır.");
            response.put("data", kaydedilen);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Hata: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/listem/{kullaniciId}")
    public ResponseEntity<?> listem(@PathVariable Long kullaniciId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", servis.kullaniciSikayetleri(kullaniciId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tum-sikayetler")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> tumSikayetler() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", servis.tumunuGetir());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('KULLANICI')")
    public ResponseEntity<?> detay(@PathVariable Long id) {
        return servis.idIleBul(id)
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", s)))
                .orElse(ResponseEntity.status(404).body(Map.of("success", false, "message", "Kayıt bulunamadı")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sil(@PathVariable Long id) {
        servis.sil(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Kayıt silindi"));
    }

    @PostMapping("/{id}/yanitla")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> yanitla(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String yeniDurumStr = body.get("durum");
        String adminNotu = body.get("adminNotu");

        SikayetOneri.Durum durum = SikayetOneri.Durum.valueOf(yeniDurumStr);
        SikayetOneri guncellenen = servis.durumGuncelle(id, durum, adminNotu);

        if (guncellenen != null) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Yanıt kaydedildi", "data", guncellenen));
        }
        return ResponseEntity.status(404).body(Map.of("success", false, "message", "Kayıt bulunamadı"));
    }
}
