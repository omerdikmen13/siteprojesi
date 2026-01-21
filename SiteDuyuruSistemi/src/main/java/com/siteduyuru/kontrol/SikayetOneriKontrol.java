package com.siteduyuru.kontrol;

import com.siteduyuru.model.SikayetOneri;
import com.siteduyuru.servis.SikayetOneriServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/sikayetler")
public class SikayetOneriKontrol {

    @Autowired
    private com.siteduyuru.servis.KullaniciServisi kullaniciServisi;

    @Autowired
    private SikayetOneriServisi servis;

    @GetMapping("/liste")
    @PreAuthorize("hasRole('ADMIN')")
    public String liste(Model model) {
        model.addAttribute("liste", servis.tumunuGetir());
        return "sikayet_liste";
    }

    @PostMapping("/guncelle/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String guncelle(@PathVariable Long id,
            @RequestParam SikayetOneri.Durum durum,
            @RequestParam(required = false) String adminNotu) {
        servis.durumGuncelle(id, durum, adminNotu);
        return "redirect:/sikayetler/liste";
    }

    @GetMapping("/sil/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String sil(@PathVariable Long id) {
        servis.sil(id);
        return "redirect:/sikayetler/liste";
    }

    @GetMapping("/yeni")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String yeni(Model model) {
        model.addAttribute("sikayetOneri", new SikayetOneri());
        return "sikayet_form";
    }

    @PostMapping("/kaydet")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String kaydet(@ModelAttribute SikayetOneri sikayetOneri, java.security.Principal principal) {
        if (principal != null) {
            com.siteduyuru.model.Kullanici k = kullaniciServisi.emailIleBul(principal.getName());
            if (k != null) {
                sikayetOneri.setKullaniciId(k.getId());
                sikayetOneri.setKullaniciAdSoyad(k.getAdSoyad());
                sikayetOneri.setKullaniciEmail(k.getEmail());
                sikayetOneri.setKullaniciDaireNo(String.valueOf(k.getDaireNo()));
            }
        }
        servis.kaydet(sikayetOneri);
        return "redirect:/sikayetler/basarili";
    }

    @GetMapping("/listem")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String listem(Model model, java.security.Principal principal) {
        if (principal != null) {
            com.siteduyuru.model.Kullanici k = kullaniciServisi.emailIleBul(principal.getName());
            if (k != null) {
                model.addAttribute("liste", servis.kullaniciSikayetleri(k.getId()));
            }
        }
        return "sikayet_kullanici_liste";
    }

    @GetMapping("/basarili")
    public String basarili(Model model) {
        return "redirect:/?sikayetBasarili";
    }
}
