package com.siteduyuru.api;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.OdemeServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Demo ödeme API kontrolcüsü.
 * iyzico sandbox benzeri endpoint yapısı.
 */
@RestController
@RequestMapping("/api/odeme")
public class OdemeApiKontrol {

    @Autowired
    private OdemeServisi odemeServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    /**
     * Ödeme işlemi yap (simülasyon).
     * POST /api/odeme/yap
     */
    @PostMapping("/intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody OdemeRequest request, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            // ADMIN ödeme yapamaz
            if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Yöneticiler aidat ödemesi yapamaz."));
            }

            // Mükerrer ödeme kontrolü
            // (Service'e taşıyabiliriz ama hızlı check için burada da olabilir)

            String clientSecret = odemeServisi.odemeNiyetiOlustur(
                    request.getAidatId(),
                    request.getTutar(),
                    auth.getName());

            return ResponseEntity.ok(Map.of("clientSecret", clientSecret));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/onayla")
    public ResponseEntity<?> odemeOnayla(@RequestBody OdemeRequest request, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }

            Long kullaniciId = request.getKullaniciId();

            // Eğer request'te ID yoksa (web akışı), Authentication üzerinden bul
            if (kullaniciId == null) {
                Kullanici user = kullaniciServisi.emailIleBul(auth.getName());
                if (user != null) {
                    kullaniciId = user.getId();
                }
            }

            if (kullaniciId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Kullanıcı belirlenemedi"));
            }

            odemeServisi.odemeBasariliIsle(
                    request.getAidatId(),
                    kullaniciId,
                    request.getTutar(),
                    request.getPaymentId());

            return ResponseEntity.ok(Map.of("success", true));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*
     * @GetMapping("/sonuc/{referansNo}")
     * public ResponseEntity<?> odemeSonuc(@PathVariable String referansNo) {
     * // ... (KOD KALDIRILDI) ...
     * return ResponseEntity.ok().build();
     * }
     */

    // ===== REQUEST DTO =====
    public static class OdemeRequest {
        private Long aidatId;
        private Long kullaniciId;
        private String kartNumarasi;
        private String kartSahibi;
        private String sonKullanmaTarihi;
        private String cvv;
        private Double tutar;
        private String paymentId; // For Stripe confirmation

        // Getters and Setters
        public String getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(String paymentId) {
            this.paymentId = paymentId;
        }

        public Long getAidatId() {
            return aidatId;
        }

        public void setAidatId(Long aidatId) {
            this.aidatId = aidatId;
        }

        public Long getKullaniciId() {
            return kullaniciId;
        }

        public void setKullaniciId(Long kullaniciId) {
            this.kullaniciId = kullaniciId;
        }

        public String getKartNumarasi() {
            return kartNumarasi;
        }

        public void setKartNumarasi(String kartNumarasi) {
            this.kartNumarasi = kartNumarasi;
        }

        public String getKartSahibi() {
            return kartSahibi;
        }

        public void setKartSahibi(String kartSahibi) {
            this.kartSahibi = kartSahibi;
        }

        public String getSonKullanmaTarihi() {
            return sonKullanmaTarihi;
        }

        public void setSonKullanmaTarihi(String sonKullanmaTarihi) {
            this.sonKullanmaTarihi = sonKullanmaTarihi;
        }

        public String getCvv() {
            return cvv;
        }

        public void setCvv(String cvv) {
            this.cvv = cvv;
        }

        public Double getTutar() {
            return tutar;
        }

        public void setTutar(Double tutar) {
            this.tutar = tutar;
        }
    }
}
