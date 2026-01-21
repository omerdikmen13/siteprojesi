package com.siteduyuru.kontrol;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.model.Harcama;
import com.siteduyuru.servis.AidatServisi;
import com.siteduyuru.servis.DuyuruServisi;
import com.siteduyuru.servis.HarcamaServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HomeKontrol {

    @Autowired
    private DuyuruServisi duyuruServisi;

    @Autowired
    private HarcamaServisi harcamaServisi;

    @Autowired
    private AidatServisi aidatServisi;

    @GetMapping("/giris")
    public String girisSayfasi() {
        return "giris";
    }

    @GetMapping("/")
    public String anaSayfa(Authentication auth, Model model) {
        if (auth != null && auth.isAuthenticated()) {
            System.out.println("ANA SAYFA ERISIMI: Kullanici dogrulandi - " + auth.getName() + ", Yetkiler: "
                    + auth.getAuthorities());
            model.addAttribute("kullaniciAdi", auth.getName());

            // 1. Duyuruları çek ve modele ekle
            model.addAttribute("duyurular", duyuruServisi.tumDuyurulariGetir());

            // 2. Harcamaları çek ve toplam gideri hesapla
            List<Harcama> harcamalar = harcamaServisi.tumHarcamalariGetir();
            model.addAttribute("harcamalar", harcamalar);

            double toplamGider = harcamalar.stream().mapToDouble(Harcama::getTutar).sum();
            model.addAttribute("toplamGider", toplamGider);

            // 3. En güncel aktif aidatı çek
            List<Aidat> aidatlar = aidatServisi.tumAidatlariGetir();
            if (!aidatlar.isEmpty()) {
                // ID'ye göre tersten sırala (en yeni en başta)
                aidatlar.sort((a1, a2) -> a2.getId().compareTo(a1.getId()));
                model.addAttribute("aktifAidat", aidatlar.get(0));
            }

            // 4. Yetki kontrolü (Admin mi Sakin mi?)
            boolean adminMi = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(r -> r.equals("ROLE_ADMIN"));

            return adminMi ? "anasayfa" : "index";
        }
        System.out.println("ANA SAYFA ERISIMI REDDEDILDI: Kimlik dogrulamasi yok veya gecersiz.");
        return "redirect:/giris";
    }

    @GetMapping("/cikis")
    public String cikis() {
        return "redirect:/giris?logout";
    }

    @GetMapping("/gemini-chat")
    public String geminiChat() {
        return "gemini-chat";
    }

}