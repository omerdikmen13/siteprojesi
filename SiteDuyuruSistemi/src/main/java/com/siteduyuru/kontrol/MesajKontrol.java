package com.siteduyuru.kontrol;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.model.Mesaj;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.MesajServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/mesajlar")
public class MesajKontrol {

    @Autowired
    private MesajServisi mesajServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    @Autowired
    private com.siteduyuru.servis.GeminiServisi geminiServisi;

    @Autowired
    private com.siteduyuru.servis.AidatServisi aidatServisi;

    @Autowired
    private com.siteduyuru.servis.OdemeServisi odemeServisi;

    @GetMapping
    public String mesajListesi(Model model, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Mesaj> rootMessages;
        if (isAdmin) {
            rootMessages = mesajServisi.adminGelenKonusmalari(k.getId());
        } else {
            rootMessages = mesajServisi.kullaniciGelenKonusmalari(k.getId());
        }

        List<Map<String, Object>> displayMessages = rootMessages.stream().map(m -> {
            // Bu konuşmadaki EN SON mesajı bul (görüntüleme için)
            Mesaj son = mesajServisi.sonMesajiBul(m.getAnaMesajId() != null ? m.getAnaMesajId() : m.getId(), k.getId());
            if (son == null)
                son = m;

            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", m.getId());
            map.put("anaMesajId", m.getAnaMesajId());
            map.put("baslik", m.getBaslik());
            map.put("icerik", son.isSilindi() ? "Bu mesaj silindi" : son.getIcerik());
            map.put("tarih", son.getTarih());
            map.put("okundu", m.isOkundu());

            // Konuşulan kişiyi belirle (Ben gönderdiysem Alıcı, O gönderdiyse Gönderen)
            Long otherUserId;
            if (son.getGonderenId().equals(k.getId())) {
                otherUserId = son.getAliciId() != null ? son.getAliciId() : m.getAliciId();
            } else {
                otherUserId = son.getGonderenId();
            }

            // Eğer karşı taraf null ise (örn: Kullanıcı -> Admin mesajında Admin tarafı)
            // Veya Admin -> Generic User (Broadcast)
            if (otherUserId == null) {
                if (isAdmin) {
                    // Admin bakıyor ve ID yok -> ? (Broadcast veya sistem)
                    map.put("gonderenAdSoyad", "Duyuru / Sistem");
                    map.put("gonderenDaire", "-");
                    map.put("gonderenRolDisplay", "Sistem");
                } else {
                    // Kullanıcı bakıyor ve alıcı yok -> Yöneticiye gitmiştir
                    map.put("gonderenAdSoyad", "Yönetici");
                    map.put("gonderenDaire", "Yönetim");
                    map.put("gonderenRolDisplay", "Yönetici");
                }
            } else {
                Kullanici g = kullaniciServisi.idIleKullaniciBul(otherUserId).orElse(null);
                if (g != null) {
                    map.put("gonderenAdSoyad", g.getAdSoyad());
                    map.put("gonderenDaire", g.getDaireNo());
                    map.put("gonderenRolDisplay", g.getRolu().getDisplayValue());
                } else {
                    map.put("gonderenAdSoyad", "Bilinmeyen Kullanıcı");
                    map.put("gonderenDaire", "");
                    map.put("gonderenRolDisplay", "-");
                }
            }
            return map;
        }).collect(Collectors.toList());

        model.addAttribute("konusmalar", displayMessages);
        model.addAttribute("isAdmin", isAdmin);
        return "mesaj_liste";
    }

    @GetMapping("/detay/{id}")
    public String mesajDetay(@PathVariable Long id, Model model, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        Mesaj root = mesajServisi.idIleBul(id).orElseThrow(() -> new IllegalArgumentException("Mesaj bulunamadı"));

        // Eğer bu bir reply ise, root'a git
        Long anaId = root.getAnaMesajId() != null ? root.getAnaMesajId() : root.getId();
        Mesaj actualRoot = mesajServisi.idIleBul(anaId).orElse(root);

        List<Mesaj> thread = mesajServisi.konusmaGecmisi(anaId, k.getId());

        // Okundu işaretle (eğer alıcı bu kullanıcıysa)
        thread.stream()
                .filter(m -> !m.isOkundu() && (m.getAliciId() == null || m.getAliciId().equals(k.getId())))
                .forEach(m -> mesajServisi.okunduIsaretle(m.getId()));

        model.addAttribute("rootMesaj", actualRoot);
        model.addAttribute("thread", thread);
        model.addAttribute("kullaniciId", k.getId());
        model.addAttribute("kullaniciServisi", kullaniciServisi); // İsimleri göstermek için

        return "mesaj_detay";
    }

    @GetMapping("/yeni")
    public String yeniMesajFormu(@RequestParam(required = false) Long aidatId, Model model, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        model.addAttribute("isAdmin", isAdmin);

        if (isAdmin) {
            model.addAttribute("kullanicilar", kullaniciServisi.tumKullanicilariGetir());

            // Eğer aidatId gelmişse (İhbarname modu)
            if (aidatId != null) {
                aidatServisi.idIleAidatBul(aidatId).ifPresent(aidat -> {
                    String taslak = geminiServisi.ihbarnameMetniOlustur(aidat.getDonem(), aidat.getTutar());
                    model.addAttribute("prefillBaslik", "Hatırlatma: " + aidat.getDonem() + " Aidat Ödemesi");
                    model.addAttribute("prefillIcerik", taslak);
                    model.addAttribute("aidatId", aidatId);
                    model.addAttribute("isIhbarname", true);
                });
            }
        }

        return "mesaj_form";
    }

    @PostMapping("/gonder")
    public String mesajGonder(@RequestParam(required = false) Long aliciId,
            @RequestParam(required = false) Long anaMesajId,
            @RequestParam(required = false) Long aidatId,
            @RequestParam String baslik,
            @RequestParam String icerik,
            @RequestParam(defaultValue = "false") String toplu,
            Authentication auth) {
        Kullanici gonderen = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin && "borclular".equals(toplu) && aidatId != null) {
            // Borçlulara toplu gönderim
            List<Kullanici> borclular = odemeServisi.borcluKullanicilar(aidatId);
            for (Kullanici borclu : borclular) {
                Mesaj mesaj = new Mesaj();
                mesaj.setGonderenId(gonderen.getId());
                mesaj.setBaslik(baslik);
                mesaj.setIcerik(icerik);
                mesaj.setTarih(LocalDateTime.now());
                mesaj.setAliciId(borclu.getId());
                mesaj.setTip(Mesaj.MesajTipi.ADMIN_TO_USER);
                mesajServisi.mesajGonder(mesaj);
            }
            return "redirect:/mesajlar?success=ihbarname";
        }

        Mesaj mesaj = new Mesaj();
        mesaj.setGonderenId(gonderen.getId());
        mesaj.setBaslik(baslik);
        mesaj.setIcerik(icerik);
        mesaj.setTarih(LocalDateTime.now());
        mesaj.setAnaMesajId(anaMesajId);

        if (isAdmin) {
            if ("true".equals(toplu) && anaMesajId == null) {
                mesaj.setTip(Mesaj.MesajTipi.ADMIN_TO_ALL);
                mesaj.setAliciId(null);
            } else {
                mesaj.setTip(Mesaj.MesajTipi.ADMIN_TO_USER);
                mesaj.setAliciId(aliciId);
            }
        } else {
            mesaj.setTip(Mesaj.MesajTipi.USER_TO_ADMIN);
            mesaj.setAliciId(null);
        }

        mesajServisi.mesajGonder(mesaj);

        if (anaMesajId != null) {
            return "redirect:/mesajlar/detay/" + anaMesajId;
        }
        return "redirect:/mesajlar?success";
    }

    @PostMapping("/sil/{id}")
    public String mesajSil(@PathVariable Long id, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        Mesaj m = mesajServisi.idIleBul(id).orElse(null);
        mesajServisi.mesajSil(id, k.getId());
        if (m != null && m.getAnaMesajId() != null) {
            return "redirect:/mesajlar/detay/" + m.getAnaMesajId();
        }
        return "redirect:/mesajlar";
    }

    @PostMapping("/konusma-sil/{anaMesajId}")
    public String konusmaSil(@PathVariable Long anaMesajId, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        mesajServisi.konusmaSil(anaMesajId, k.getId());
        return "redirect:/mesajlar";
    }
}
