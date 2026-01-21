package com.siteduyuru.api;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.AidatServisi;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.OdemeServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/aidatlar")
public class AidatApiKontrol {

        @Autowired
        private AidatServisi aidatServisi;

        @Autowired
        private OdemeServisi odemeServisi;

        @Autowired
        private KullaniciServisi kullaniciServisi;

        // Tüm kullanıcılar aidatları görebilir
        // Tüm kullanıcılar aidatları görebilir
        @GetMapping
        public ResponseEntity<?> tumAidatlar(Authentication auth) {
                List<Aidat> liste = aidatServisi.tumAidatlariGetir();
                List<Map<String, Object>> sonuclar = new ArrayList<>();

                Kullanici currentKullanici = null;
                if (auth != null && auth.isAuthenticated()) {
                        currentKullanici = kullaniciServisi.emailIleBul(auth.getName());
                }

                boolean isAdmin = auth != null
                                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                for (Aidat a : liste) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", a.getId());
                        map.put("donem", a.getDonem());
                        map.put("tutar", a.getTutar());
                        map.put("durum", a.getDurum());
                        map.put("daireSayisi", a.getDaireSayisi());

                        // Kişisel ödeme durumu (Sadece Sakinler için anlamlı ama admin de False görür)
                        boolean personalPaid = false;
                        if (currentKullanici != null) {
                                personalPaid = odemeServisi.kullaniciOdediMi(currentKullanici.getId(), a.getId());
                        }
                        map.put("personalPaid", personalPaid);

                        // Ödeme İstatistikleri
                        OdemeServisi.OdemeIstatistik istatistik = odemeServisi.aidatOdemeIstatistik(a.getId());
                        map.put("odeyenSayisi", istatistik.odeyenSayisi);
                        map.put("odemeyenSayisi", istatistik.odemeyenSayisi);

                        if (isAdmin) {
                                map.put("toplamToplanan", istatistik.toplamToplanan);
                        }

                        sonuclar.add(map);
                }

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", sonuclar);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> aidatDetay(@PathVariable Long id, Authentication auth) {
                Optional<Aidat> aidatOpt = aidatServisi.idIleAidatBul(id);
                if (aidatOpt.isEmpty()) {
                        return ResponseEntity.status(404).body(Map.of("success", false, "message", "Aidat bulunamadı"));
                }

                Aidat a = aidatOpt.get();
                Map<String, Object> data = new HashMap<>();
                data.put("id", a.getId());
                data.put("donem", a.getDonem());
                data.put("tutar", a.getTutar());
                data.put("durum", a.getDurum());
                data.put("daireSayisi", a.getDaireSayisi());

                // İstatistikler
                OdemeServisi.OdemeIstatistik stats = odemeServisi.aidatOdemeIstatistik(id);
                data.put("stats", stats);

                // Yetki kontrolü
                boolean isAdmin = auth != null && auth.getAuthorities().stream()
                                .anyMatch(au -> au.getAuthority().equals("ROLE_ADMIN"));
                if (isAdmin) {
                        data.put("odeyenler", odemeServisi.aidatOdeyenler(id));
                        data.put("borclular", odemeServisi.borcluKullanicilar(id));
                }

                return ResponseEntity.ok(Map.of("success", true, "data", data));
        }

        @GetMapping("/{id}/borclular")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> aidatBorclular(@PathVariable Long id) {
                List<Kullanici> borclular = odemeServisi.borcluKullanicilar(id);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", borclular));
        }

        // Sadece yönetici aidat ekleyebilir
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> aidatEkle(@RequestBody Aidat aidat) {
                Aidat kaydedilen = aidatServisi.aidatKaydet(aidat);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "message", "Aidat eklendi",
                                "data", kaydedilen));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> aidatGuncelle(@PathVariable Long id, @RequestBody Aidat aidat) {
                return aidatServisi.idIleAidatBul(id)
                                .map(mevcut -> {
                                        mevcut.setAy(aidat.getAy());
                                        mevcut.setYil(aidat.getYil());
                                        mevcut.setTutar(aidat.getTutar());
                                        mevcut.setDaireSayisi(aidat.getDaireSayisi());
                                        Aidat kaydedilen = aidatServisi.aidatKaydet(mevcut);
                                        return ResponseEntity.ok(Map.of("success", true, "message", "Aidat güncellendi",
                                                        "data", kaydedilen));
                                })
                                .orElse(ResponseEntity.status(404)
                                                .body(Map.of("success", false, "message", "Aidat bulunamadı")));
        }

        @GetMapping("/{id}/odeyenler")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> aidatOdeyenler(@PathVariable Long id) {
                List<com.siteduyuru.model.KullaniciAidatOdeme> odeyenler = odemeServisi.aidatOdeyenler(id);
                return ResponseEntity.ok(Map.of(
                                "success", true,
                                "data", odeyenler));
        }

        // Aidat ödeme endpoint'i (kullanıcılar kendi aidatlarını ödeyebilir)
        @PostMapping("/ode/{id}")
        public ResponseEntity<?> aidatOde(@PathVariable Long id) {
                return aidatServisi.idIleAidatBul(id)
                                .map(aidat -> {
                                        aidat.setDurum(Aidat.AidatDurumu.ODENDI);
                                        aidatServisi.aidatKaydet(aidat);
                                        return ResponseEntity.ok(Map.of(
                                                        "success", true,
                                                        "message", "Aidat ödendi"));
                                })
                                .orElse(ResponseEntity.status(404).body(Map.of(
                                                "success", false,
                                                "message", "Aidat bulunamadı")));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> aidatSil(@PathVariable Long id) {
                try {
                        aidatServisi.aidatSil(id);
                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "message", "Aidat başarıyla silindi"));
                } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Aidat silinirken hata oluştu: " + e.getMessage()));
                }
        }
}