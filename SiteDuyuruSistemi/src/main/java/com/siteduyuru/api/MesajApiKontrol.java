package com.siteduyuru.api;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.model.Mesaj;
import com.siteduyuru.servis.KullaniciServisi;
import com.siteduyuru.servis.MesajServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mesajlar")
public class MesajApiKontrol {

    @Autowired
    private MesajServisi mesajServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    @Autowired
    private com.siteduyuru.servis.OdemeServisi odemeServisi;

    @GetMapping("/konusmalar")
    public ResponseEntity<?> gelenKonusmalar(Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Mesaj> konusmalar;
        if (isAdmin) {
            konusmalar = mesajServisi.adminGelenKonusmalari(k.getId());
        } else {
            konusmalar = mesajServisi.kullaniciGelenKonusmalari(k.getId());
        }

        // Gönderen/Alıcı detaylarını ekleyerek dön
        List<Map<String, Object>> result = konusmalar.stream().map(m -> {
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
            map.put("tip", son.getTip());
            map.put("gonderenId", son.getGonderenId());
            map.put("silindi", son.isSilindi());

            // Konuşulan kişiyi belirle (Ben gönderdiysem Alıcı, O gönderdiyse Gönderen)
            Long otherUserId;
            if (son.getGonderenId().equals(k.getId())) {
                otherUserId = son.getAliciId() != null ? son.getAliciId() : m.getAliciId();
            } else {
                otherUserId = son.getGonderenId();
            }

            if (otherUserId == null) {
                if (isAdmin) {
                    map.put("gonderenAdSoyad", "Duyuru / Sistem");
                    map.put("gonderenDaire", "-");
                    map.put("gonderenRol", "SYSTEM");
                } else {
                    map.put("gonderenAdSoyad", "Yönetici");
                    map.put("gonderenDaire", "Yönetim");
                    map.put("gonderenRol", "ADMIN");
                }
            } else {
                Kullanici g = kullaniciServisi.idIleKullaniciBul(otherUserId).orElse(null);
                if (g != null) {
                    map.put("gonderenAdSoyad", g.getAdSoyad());
                    map.put("gonderenDaire", g.getDaireNo());
                    map.put("gonderenRol", g.getRolu().name());
                } else {
                    map.put("gonderenAdSoyad", "Bilinmeyen Kullanıcı");
                    map.put("gonderenDaire", "");
                    map.put("gonderenRol", "USER");
                }
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @GetMapping("/konusma/{anaMesajId}")
    public ResponseEntity<?> konusmaDetay(@PathVariable Long anaMesajId, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        List<Mesaj> gecmis = mesajServisi.konusmaGecmisi(anaMesajId, k.getId());

        List<Map<String, Object>> result = gecmis.stream().map(m -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", m.getId());
            map.put("baslik", m.getBaslik());
            map.put("icerik", m.isSilindi() ? "Bu mesaj silindi" : m.getIcerik());
            map.put("tarih", m.getTarih());
            map.put("gonderenId", m.getGonderenId());
            map.put("aliciId", m.getAliciId());
            map.put("anaMesajId", m.getAnaMesajId());
            map.put("okundu", m.isOkundu());
            map.put("silindi", m.isSilindi());

            Kullanici g = kullaniciServisi.idIleKullaniciBul(m.getGonderenId()).orElse(null);
            if (g != null) {
                map.put("gonderenAdSoyad", g.getAdSoyad());
                map.put("gonderenDaire", g.getDaireNo());
                map.put("gonderenRol", g.getRolu().name());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @PostMapping("/gonder")
    public ResponseEntity<?> mesajGonder(@RequestBody Map<String, Object> body, Authentication auth) {
        Kullanici gonderen = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        Mesaj mesaj = new Mesaj();
        mesaj.setGonderenId(gonderen.getId());
        mesaj.setBaslik((String) body.get("baslik"));
        mesaj.setIcerik((String) body.get("icerik"));
        mesaj.setTarih(LocalDateTime.now());

        // Threading desteği
        if (body.get("anaMesajId") != null) {
            mesaj.setAnaMesajId(Long.valueOf(body.get("anaMesajId").toString()));
            // Yanıt ise, başlık otomatik olarak RE: baseline eklenebilir
            if (!mesaj.getBaslik().startsWith("RE:")) {
                mesaj.setBaslik("RE: " + mesaj.getBaslik());
            }
        }

        if (isAdmin) {
            Object topluObj = body.get("toplu");
            String topluStr = topluObj != null ? topluObj.toString() : "false";
            Long aidatId = body.get("aidatId") != null ? Long.valueOf(body.get("aidatId").toString()) : null;

            if ("borclular".equals(topluStr) && aidatId != null) {
                // Borçlulara toplu gönderim
                List<Kullanici> borclular = odemeServisi.borcluKullanicilar(aidatId);
                for (Kullanici borclu : borclular) {
                    Mesaj m = new Mesaj();
                    m.setGonderenId(gonderen.getId());
                    m.setBaslik(mesaj.getBaslik());
                    m.setIcerik(mesaj.getIcerik());
                    m.setTarih(LocalDateTime.now());
                    m.setAliciId(borclu.getId());
                    m.setTip(Mesaj.MesajTipi.ADMIN_TO_USER);
                    mesajServisi.mesajGonder(m);
                }
                return ResponseEntity.ok(Map.of("success", true, "message", "İhbarnameler gönderildi"));
            }

            if ("true".equals(topluStr)) {
                mesaj.setTip(Mesaj.MesajTipi.ADMIN_TO_ALL);
            } else {
                mesaj.setTip(Mesaj.MesajTipi.ADMIN_TO_USER);
                if (body.get("aliciId") != null) {
                    mesaj.setAliciId(Long.valueOf(body.get("aliciId").toString()));
                }
            }
        } else {
            mesaj.setTip(Mesaj.MesajTipi.USER_TO_ADMIN);
        }

        mesajServisi.mesajGonder(mesaj);
        return ResponseEntity.ok(Map.of("success", true, "message", "Mesaj gönderildi"));
    }

    @PostMapping("/{id}/oku")
    public ResponseEntity<?> okunduIsaretle(@PathVariable Long id) {
        mesajServisi.okunduIsaretle(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/sayi")
    public ResponseEntity<?> okunmamisSayisi(Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        long sayi = isAdmin ? mesajServisi.adminOkunmamisSayisi() : mesajServisi.okunmamisSayisi(k.getId());
        return ResponseEntity.ok(Map.of("success", true, "count", sayi));
    }

    @PostMapping("/sil/{id}")
    public ResponseEntity<?> mesajSil(@PathVariable Long id, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        mesajServisi.mesajSil(id, k.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Mesaj silindi"));
    }

    @PostMapping("/konusma-sil/{anaMesajId}")
    public ResponseEntity<?> konusmaSil(@PathVariable Long anaMesajId, Authentication auth) {
        Kullanici k = kullaniciServisi.emailIleBul(auth.getName());
        mesajServisi.konusmaSil(anaMesajId, k.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Konuşma silindi"));
    }

    // Geriye dönük uyumluluk için eski gelenler endpoint'i (sadece liste olarak
    // kalsın)
    @GetMapping("/gelenler")
    public ResponseEntity<?> gelenKutusu(Authentication auth) {
        return gelenKonusmalar(auth);
    }
}
