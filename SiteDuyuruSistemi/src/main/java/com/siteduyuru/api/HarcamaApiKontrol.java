package com.siteduyuru.api;

import com.siteduyuru.model.Harcama;
import com.siteduyuru.servis.HarcamaServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/harcamalar")
public class HarcamaApiKontrol {

    @Autowired
    private HarcamaServisi harcamaServisi;

    // Tüm kullanıcılar harcamaları görebilir
    @GetMapping
    public ResponseEntity<?> tumHarcamalar() {
        List<Harcama> liste = harcamaServisi.tumHarcamalariGetir();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", liste,
                "count", liste.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> harcamaDetay(@PathVariable Long id) {
        try {
            Harcama harcama = harcamaServisi.idIleHarcamaGetir(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", harcama));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Harcama bulunamadı"));
        }
    }

    // Sadece yönetici harcama ekleyebilir
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> harcamaEkle(@RequestBody Harcama harcama) {
        Harcama kaydedilen = harcamaServisi.harcamaKaydet(harcama);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Harcama eklendi",
                "data", kaydedilen));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> harcamaGuncelle(@PathVariable Long id, @RequestBody Harcama harcama) {
        try {
            Harcama mevcut = harcamaServisi.idIleHarcamaGetir(id);
            mevcut.setBaslik(harcama.getBaslik());
            mevcut.setAciklama(harcama.getAciklama());
            mevcut.setTutar(harcama.getTutar());
            mevcut.setKategori(harcama.getKategori());
            Harcama kaydedilen = harcamaServisi.harcamaKaydet(mevcut);
            return ResponseEntity.ok(Map.of("success", true, "message", "Harcama güncellendi", "data", kaydedilen));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Harcama bulunamadı"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> harcamaSil(@PathVariable Long id) {
        try {
            harcamaServisi.harcamaSil(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Harcama başarıyla silindi"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Harcama silinirken hata oluştu: " + e.getMessage()));
        }
    }
}