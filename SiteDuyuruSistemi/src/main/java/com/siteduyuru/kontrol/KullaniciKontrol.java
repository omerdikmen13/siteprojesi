package com.siteduyuru.kontrol;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.KullaniciServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/kullanici")
@PreAuthorize("hasRole('ADMIN')") // Sadece admin erişebilir
public class KullaniciKontrol {

    @Autowired
    private KullaniciServisi kullaniciServisi;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/liste")
    public String kullaniciListe(Model model) {
        model.addAttribute("kullanicilar", kullaniciServisi.tumKullanicilariGetir());
        return "kullanici-list";
    }

    @GetMapping("/detay/{id}")
    public String kullaniciDetay(@PathVariable Long id, Model model) {
        model.addAttribute("kullanici", kullaniciServisi.idIleGetir(id)); 
        return "kullanici-detay";
    }

    @GetMapping("/yeni")
    public String yeniKullanici(Model model) {
        model.addAttribute("kullanici", new Kullanici());
        model.addAttribute("roller", Kullanici.KullaniciRolu.values());
        return "kullanici-form";
    }

    @PostMapping("/kaydet")
    public String kullaniciKaydet(@ModelAttribute Kullanici kullanici) {
        kullanici.setSifre(passwordEncoder.encode(kullanici.getSifre()));
        kullaniciServisi.kullaniciKaydet(kullanici);
        return "redirect:/kullanici/liste";
    }

    @PostMapping("/sil/{id}")
    public String kullaniciSil(@PathVariable Long id) {
        kullaniciServisi.kullaniciSil(id);
        return "redirect:/kullanici/liste";
    }
}