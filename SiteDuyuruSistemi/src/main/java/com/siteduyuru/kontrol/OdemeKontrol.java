package com.siteduyuru.kontrol;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.servis.AidatServisi;
import com.siteduyuru.servis.OdemeServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Web tarafı ödeme kontrolcüsü.
 * Demo ödeme sistemi için Thymeleaf sayfalarını yönetir.
 */
@Controller
@RequestMapping("/odeme")
public class OdemeKontrol {

    @Autowired
    private OdemeServisi odemeServisi;

    @Autowired
    private AidatServisi aidatServisi;

    /**
     * Ödeme formu sayfası
     */
    @GetMapping("/{aidatId}")
    public String odemeFormu(@PathVariable Long aidatId, Model model, Authentication auth) {
        Aidat aidat = aidatServisi.idIleAidatBul(aidatId)
                .orElseThrow(() -> new IllegalArgumentException("Aidat bulunamadı: " + aidatId));

        // Zaten ödenmişse listeye yönlendir
        if (aidat.getDurum() == Aidat.AidatDurumu.ODENDI) {
            return "redirect:/aidatlar/liste?mesaj=zaten_odendi";
        }

        model.addAttribute("aidat", aidat);
        model.addAttribute("kullaniciEmail", auth.getName());
        return "odeme";
    }

    /**
     * Ödeme işlemi (POST)
     */
    /**
     * Ödeme işlemi (POST)
     * (Stripe entegrasyonu sonrası web ödemesi geçici olarak devre dışı)
     */
    /*
     * @PostMapping("/yap")
     * public String odemeYap(
     * 
     * @RequestParam Long aidatId,
     * 
     * @RequestParam String kartNumarasi,
     * 
     * @RequestParam String kartSahibi,
     * 
     * @RequestParam String sonKullanma,
     * 
     * @RequestParam String cvv,
     * 
     * @RequestParam Double tutar,
     * Authentication auth,
     * RedirectAttributes redirectAttributes) {
     * 
     * try {
     * // Ödeme simülasyonunu gerçekleştir
     * // ... (KOD KALDIRILDI - Stripe Entegrasyonu) ...
     * redirectAttributes.addFlashAttribute("basarisiz", true);
     * redirectAttributes.addFlashAttribute("mesaj",
     * "Web üzerinden ödeme geçici olarak kapalıdır. Lütfen mobil uygulamayı kullanınız."
     * );
     * return "redirect:/odeme/" + aidatId;
     * 
     * } catch (Exception e) {
     * redirectAttributes.addFlashAttribute("basarisiz", true);
     * redirectAttributes.addFlashAttribute("mesaj",
     * "Ödeme işlemi sırasında bir hata oluştu.");
     * return "redirect:/odeme/" + aidatId;
     * }
     * }
     */

    /**
     * Ödeme sonuç sayfası
     * (Kaldırıldı veya stripe ile uyumsuz olduğu için yorum satına alındı)
     */
    /*
     * @GetMapping("/sonuc/{referansNo}")
     * public String odemeSonuc(@PathVariable String referansNo, Model model) {
     * // ... (KOD KALDIRILDI) ...
     * return "redirect:/aidatlar/liste";
     * }
     */
}
