package com.siteduyuru.kontrol;

import com.siteduyuru.model.Harcama;
import com.siteduyuru.servis.HarcamaServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
// Hem tekil hem çoğul URL'leri kabul etmesi için diziyi güncelledik
@RequestMapping({ "/harcamalar", "/harcama" })
public class HarcamaKontrol {

    @Autowired
    private HarcamaServisi harcamaServisi;

    // LİSTE
    @GetMapping("/liste")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String harcamaListe(Model model) {
        List<Harcama> harcamalar = harcamaServisi.tumHarcamalariGetir();
        model.addAttribute("harcamalar", harcamalar);
        return "harcama_liste"; // HTML dosya adıyla tam uyumlu
    }

    // YENİ FORM
    @GetMapping("/yeni")
    @PreAuthorize("hasRole('ADMIN')")
    public String yeniHarcamaForm(Model model) {
        model.addAttribute("harcama", new Harcama());
        return "harcama_form";
    }

    // DÜZENLEME (Kalem ikonu için)
    @GetMapping("/duzenle/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String harcamaDuzenle(@PathVariable Long id, Model model) {
        Harcama harcama = harcamaServisi.idIleHarcamaGetir(id);
        model.addAttribute("harcama", harcama);
        return "harcama_form";
    }

    // KAYDET
    @PostMapping("/kaydet")
    @PreAuthorize("hasRole('ADMIN')")
    public String harcamaKaydet(@ModelAttribute Harcama harcama) {
        harcamaServisi.harcamaKaydet(harcama);
        return "redirect:/harcamalar/liste";
    }

    // DETAY
    @GetMapping("/detay/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String harcamaDetay(@PathVariable Long id, Model model) {
        Harcama harcama = harcamaServisi.idIleHarcamaGetir(id);
        model.addAttribute("harcama", harcama);
        return "harcama_detay";
    }

    // SİL
    @GetMapping("/sil/{id}") // 404 almamak için GET yaptık
    @PreAuthorize("hasRole('ADMIN')")
    public String harcamaSil(@PathVariable Long id) {
        harcamaServisi.harcamaSil(id);
        return "redirect:/harcamalar/liste";
    }
}