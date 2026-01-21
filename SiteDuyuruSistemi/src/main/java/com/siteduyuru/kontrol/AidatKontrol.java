package com.siteduyuru.kontrol;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.AidatServisi;
import com.siteduyuru.servis.HarcamaServisi;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.OdemeServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping({ "/aidatlar", "/aidat" })
public class AidatKontrol {

    @Autowired
    private AidatServisi aidatServisi;

    @Autowired
    private HarcamaServisi harcamaServisi;

    @Autowired
    private OdemeServisi odemeServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    // =======================
    // AİDAT LİSTESİ
    // =======================
    @GetMapping("/liste")
    @PreAuthorize("hasAnyRole('ADMIN', 'KULLANICI')")
    public String aidatListe(Model model, Authentication auth) {
        List<Aidat> aidatlar = aidatServisi.tumAidatlariGetir();
        Kullanici currentKullanici = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<AidatWrapper> wrappers = aidatlar.stream().map(aidat -> {
            boolean personalPaid = currentKullanici != null &&
                    odemeServisi.kullaniciOdediMi(currentKullanici.getId(), aidat.getId());

            OdemeServisi.OdemeIstatistik stats = odemeServisi.aidatOdemeIstatistik(aidat.getId());
            String progressInfo = stats.odeyenSayisi + "/" + stats.toplamDaire;

            return new AidatWrapper(aidat, personalPaid, progressInfo, stats.toplamToplanan);
        }).collect(Collectors.toList());

        model.addAttribute("wrappers", wrappers);
        model.addAttribute("isAdmin", isAdmin);
        return "aidat_liste";
    }

    public static class AidatWrapper {
        private Aidat aidat;
        private boolean personalPaid;
        private String progressInfo;
        private double toplamToplanan;

        public AidatWrapper(Aidat aidat, boolean personalPaid, String progressInfo, double toplamToplanan) {
            this.aidat = aidat;
            this.personalPaid = personalPaid;
            this.progressInfo = progressInfo;
            this.toplamToplanan = toplamToplanan;
        }

        public Aidat getAidat() {
            return aidat;
        }

        public boolean isPersonalPaid() {
            return personalPaid;
        }

        public String getProgressInfo() {
            return progressInfo;
        }

        public double getToplamToplanan() {
            return toplamToplanan;
        }
    }

    // =======================
    // AİDAT CRUD
    // =======================
    @GetMapping("/yeni")
    @PreAuthorize("hasRole('ADMIN')")
    public String yeniAidatFormu(Model model) {
        model.addAttribute("aidat", new Aidat());
        model.addAttribute("toplamGider", harcamaServisi.tumHarcamalariGetir()
                .stream().mapToDouble(h -> h.getTutar()).sum());
        return "aidat_form";
    }

    @PostMapping("/kaydet")
    @PreAuthorize("hasRole('ADMIN')")
    public String aidatKaydet(@ModelAttribute Aidat aidat) {
        aidatServisi.aidatKaydet(aidat);
        return "redirect:/aidatlar/liste";
    }

    @GetMapping("/duzenle/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String aidatDuzenleFormu(@PathVariable Long id, Model model) {
        Aidat aidat = aidatServisi.idIleAidatBul(id)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz aidat ID"));
        model.addAttribute("aidat", aidat);
        model.addAttribute("toplamGider", harcamaServisi.tumHarcamalariGetir()
                .stream().mapToDouble(h -> h.getTutar()).sum());
        return "aidat_form";
    }

    @GetMapping("/sil/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String aidatSil(@PathVariable Long id) {
        aidatServisi.aidatSil(id);
        return "redirect:/aidatlar/liste";
    }

    // =======================
    // AİDAT DETAY
    // =======================
    @GetMapping("/detay/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','KULLANICI')")
    public String aidatDetay(@PathVariable Long id, Model model, Authentication auth) {
        Aidat aidat = aidatServisi.idIleAidatBul(id)
                .orElseThrow(() -> new IllegalArgumentException("Geçersiz aidat ID"));

        model.addAttribute("aidat", aidat);
        model.addAttribute("harcamalar", harcamaServisi.tumHarcamalariGetir());

        // İstatistikler
        OdemeServisi.OdemeIstatistik stats = odemeServisi.aidatOdemeIstatistik(id);
        model.addAttribute("stats", stats);

        // Admin ise ödeyenleri ve borçluları da görsün
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        model.addAttribute("isAdmin", isAdmin);

        if (isAdmin) {
            model.addAttribute("odeyenler", odemeServisi.aidatOdeyenler(id));
            model.addAttribute("borclular", odemeServisi.borcluKullanicilar(id));
        }

        return "aidat_detay";
    }
}