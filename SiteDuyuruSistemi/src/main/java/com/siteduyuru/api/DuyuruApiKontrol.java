package com.siteduyuru.api;

import com.siteduyuru.model.Duyuru;
import com.siteduyuru.servis.DuyuruServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/duyurular")
public class DuyuruApiKontrol {

    @Autowired
    private DuyuruServisi duyuruServisi;

    @GetMapping
    public ResponseEntity<?> tumDuyurular() {
        List<Duyuru> liste = duyuruServisi.tumDuyurulariGetir();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", liste,
                "count", liste.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> duyuruDetay(@PathVariable Long id) {
        return duyuruServisi.idIleDuyuruBul(id)
                .map(d -> ResponseEntity.ok(Map.of("success", true, "data", d)))
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Duyuru bulunamadı")));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> duyuruEkle(@RequestBody Duyuru duyuru) {
        Duyuru kaydedilen = duyuruServisi.duyuruKaydet(duyuru);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Duyuru eklendi",
                "data", kaydedilen));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> duyuruGuncelle(@PathVariable Long id, @RequestBody Duyuru duyuru) {
        return duyuruServisi.idIleDuyuruBul(id)
                .map(mevcut -> {
                    mevcut.setBaslik(duyuru.getBaslik());
                    mevcut.setIcerik(duyuru.getIcerik());
                    mevcut.setOnemli(duyuru.isOnemli());
                    mevcut.setAnketMi(duyuru.isAnketMi());
                    mevcut.setAnketSecenekleri(duyuru.getAnketSecenekleri());
                    Duyuru kaydedilen = duyuruServisi.duyuruKaydet(mevcut);
                    return ResponseEntity
                            .ok(Map.of("success", true, "message", "Duyuru güncellendi", "data", kaydedilen));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("success", false, "message", "Duyuru bulunamadı")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> duyuruSil(@PathVariable Long id) {
        duyuruServisi.duyuruSil(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Duyuru silindi"));
    }

    // ⭐ YENİ: OY VERME ENDPOINT'İ
    @PostMapping("/oy-ver")
    public ResponseEntity<?> oyVer(@RequestBody OyRequest request, Authentication auth) {
        try {
            // Duyuruyu bul
            Duyuru duyuru = duyuruServisi.idIleDuyuruBul(request.getDuyuruId())
                    .orElse(null);

            if (duyuru == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Duyuru bulunamadı"));
            }

            // Anket kontrolü
            if (!duyuru.isAnketMi()) {
                return ResponseEntity.status(400).body(Map.of(
                        "success", false,
                        "message", "Bu duyuru anket içermiyor"));
            }

            // Seçenek geçerli mi?
            if (request.getSecenekIndex() < 0 || request.getSecenekIndex() >= duyuru.getAnketSecenekleri().size()) {
                return ResponseEntity.status(400).body(Map.of(
                        "success", false,
                        "message", "Geçersiz seçenek"));
            }

            // Kullanıcının oyunu kaydet
            String kullaniciAdi = auth.getName();
            duyuru.getOylar().put(kullaniciAdi, request.getSecenekIndex());

            duyuruServisi.duyuruKaydet(duyuru);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Oyunuz kaydedildi"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Bir hata oluştu: " + e.getMessage()));
        }
    }

    // ===== OY REQUEST DTO =====
    public static class OyRequest {
        private Long duyuruId;
        private Integer secenekIndex;

        public Long getDuyuruId() {
            return duyuruId;
        }

        public void setDuyuruId(Long duyuruId) {
            this.duyuruId = duyuruId;
        }

        public Integer getSecenekIndex() {
            return secenekIndex;
        }

        public void setSecenekIndex(Integer secenekIndex) {
            this.secenekIndex = secenekIndex;
        }
    }
}