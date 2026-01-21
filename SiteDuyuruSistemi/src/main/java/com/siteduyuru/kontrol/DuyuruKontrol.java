package com.siteduyuru.kontrol;

import com.siteduyuru.model.Duyuru;
import com.siteduyuru.servis.DuyuruServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/duyurular")
public class DuyuruKontrol {

    @Autowired
    private DuyuruServisi duyuruServisi;

    @GetMapping("/liste")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String duyuruListe(Model model) {
        model.addAttribute("duyurular", duyuruServisi.tumDuyurulariGetir());
        return "duyuru_liste";
    }

    @GetMapping("/yeni")
    @PreAuthorize("hasRole('ADMIN')")
    public String yeniDuyuruForm(Model model) {
        model.addAttribute("duyuru", new Duyuru());
        return "duyuru_form";
    }

    @PostMapping("/kaydet")
    @PreAuthorize("hasRole('ADMIN')")
    public String duyuruKaydet(@ModelAttribute Duyuru duyuru, @RequestParam(required = false) String seceneklerRaw) {
        if (duyuru.isAnketMi() && seceneklerRaw != null && !seceneklerRaw.isEmpty()) {
            List<String> secenekListesi = Arrays.stream(seceneklerRaw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            duyuru.setAnketSecenekleri(secenekListesi);
        }
        duyuruServisi.duyuruKaydet(duyuru);
        return "redirect:/duyurular/liste";
    }

    @PostMapping("/oy-ver")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String oyVer(@RequestParam Long duyuruId, @RequestParam int secenekIndex, Authentication auth) {
        Duyuru duyuru = duyuruServisi.idIleDuyuruBul(duyuruId)
                .orElseThrow(() -> new IllegalArgumentException("Duyuru bulunamadı"));

        // Kullanıcının oyunu haritaya ekle veya güncelle
        duyuru.getOylar().put(auth.getName(), secenekIndex);
        duyuruServisi.duyuruKaydet(duyuru);

        return "redirect:/duyurular/detay/" + duyuruId;
    }

    @GetMapping("/duzenle/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String duyuruDuzenle(@PathVariable Long id, Model model) {
        Duyuru duyuru = duyuruServisi.idIleDuyuruBul(id)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz duyuru ID: " + id));
        model.addAttribute("duyuru", duyuru);

        // Mevcut seçenekleri virgülle birleştirip formda göstermek için
        String mevcutSecenekler = String.join(", ", duyuru.getAnketSecenekleri());
        model.addAttribute("mevcutSecenekler", mevcutSecenekler);

        return "duyuru_form";
    }

    @GetMapping("/sil/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String duyuruSil(@PathVariable Long id) {
        duyuruServisi.duyuruSil(id);
        return "redirect:/duyurular/liste";
    }

    @GetMapping("/detay/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String duyuruDetay(@PathVariable Long id, Model model) {
        Duyuru duyuru = duyuruServisi.idIleDuyuruBul(id)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz duyuru ID: " + id));
        model.addAttribute("duyuru", duyuru);
        return "duyuru_detay";
    }
}