package com.siteduyuru.api;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.model.Duyuru;
import com.siteduyuru.model.Harcama;
import com.siteduyuru.model.Kullanici;
import com.siteduyuru.servis.AidatServisi;
import com.siteduyuru.servis.DuyuruServisi;
import com.siteduyuru.servis.GeminiServisi;
import com.siteduyuru.servis.HarcamaServisi;
import com.siteduyuru.servis.KullaniciServisi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gemini")
public class GeminiApiKontrol {

        @Autowired
        private GeminiServisi geminiServisi;

        @Autowired
        private DuyuruServisi duyuruServisi;

        @Autowired
        private AidatServisi aidatServisi;

        @Autowired
        private HarcamaServisi harcamaServisi;

        @Autowired
        private KullaniciServisi kullaniciServisi;

        /**
         * Duyurular hakkında Gemini'ye soru sor
         */
        @PostMapping("/duyuru-soru")
        public ResponseEntity<?> duyuruSoru(@RequestBody Map<String, String> request) {
                try {
                        String soru = request.get("soru");

                        if (soru == null || soru.isEmpty()) {
                                return ResponseEntity.badRequest().body(Map.of(
                                                "success", false,
                                                "message", "Soru boş olamaz"));
                        }

                        List<Duyuru> duyurular = duyuruServisi.tumDuyurulariGetir();

                        if (duyurular.isEmpty()) {
                                return ResponseEntity.ok(Map.of(
                                                "success", true,
                                                "soru", soru,
                                                "cevap", "Sistemde henüz duyuru bulunmamaktadır."));
                        }

                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

                        String duyuruMetni = duyurular.stream()
                                        .map(d -> String.format("""
                                                        - Başlık: %s
                                                        - İçerik: %s
                                                        - Tarih: %s
                                                        - Önemli mi: %s
                                                        - Anket mi: %s
                                                        """,
                                                        d.getBaslik(),
                                                        d.getIcerik(),
                                                        d.getOlusturmaTarihi().format(formatter),
                                                        d.isOnemli() ? "Evet" : "Hayır",
                                                        d.isAnketMi() ? "Evet" : "Hayır"))
                                        .collect(Collectors.joining("\n---\n"));

                        String prompt = String.format("""
                                        SEN BİR SİTE YÖNETİM ASİSTANISIN.

                                        ÖNEMLİ KURAL: SADECE AŞAĞIDAKİ VERİLERİ KULLAN. KENDI BİLGİLERİNİ EKLEME!

                                        SİSTEMDEKİ DUYURULAR (%d adet):
                                        %s

                                        KULLANICI SORUSU: %s

                                        CEVAP KURALLARI:
                                        1. Sadece yukarıdaki duyuruları kullan
                                        2. Uydurma bilgi verme
                                        3. Eğer bilmiyorsan "Bu bilgi sistemde yok" de
                                        4. Türkçe ve kısa cevap ver (maksimum 3-4 cümle)
                                        5. Tarih formatını koru (gg.aa.yyyy ss:dd)
                                        """,
                                        duyurular.size(),
                                        duyuruMetni,
                                        soru);

                        String cevap = geminiServisi.metinUret(prompt);

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "soru", soru,
                                        "cevap", cevap));

                } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Hata: " + e.getMessage()));
                }
        }

        /**
         * Aidatlar hakkında Gemini'ye soru sor
         */
        @PostMapping("/aidat-soru")
        public ResponseEntity<?> aidatSoru(@RequestBody Map<String, String> request) {
                try {
                        String soru = request.get("soru");

                        if (soru == null || soru.isEmpty()) {
                                return ResponseEntity.badRequest().body(Map.of(
                                                "success", false,
                                                "message", "Soru boş olamaz"));
                        }

                        List<Aidat> aidatlar = aidatServisi.tumAidatlariGetir();

                        if (aidatlar.isEmpty()) {
                                return ResponseEntity.ok(Map.of(
                                                "success", true,
                                                "soru", soru,
                                                "cevap", "Sistemde henüz aidat kaydı bulunmamaktadır."));
                        }

                        String aidatMetni = aidatlar.stream()
                                        .map(a -> String.format("""
                                                        - Dönem: %s
                                                        - Tutar: %.2f TL
                                                        - Durum: %s
                                                        - Ödeme Tarihi: %s
                                                        """,
                                                        a.getDonem(),
                                                        a.getTutar(),
                                                        a.getDurum().getDisplayValue(),
                                                        a.getOdemeTarihi() != null ? a.getOdemeTarihi().toString()
                                                                        : "Henüz ödenmedi"))
                                        .collect(Collectors.joining("\n---\n"));

                        String prompt = String.format("""
                                        SEN BİR SİTE YÖNETİM ASİSTANISIN.

                                        ÖNEMLİ KURAL: SADECE AŞAĞIDAKİ VERİLERİ KULLAN. KENDI BİLGİLERİNİ EKLEME!

                                        SİSTEMDEKİ AİDATLAR (%d adet):
                                        %s

                                        KULLANICI SORUSU: %s

                                        CEVAP KURALLARI:
                                        1. Sadece yukarıdaki aidatları kullan
                                        2. Uydurma bilgi verme
                                        3. Ödenmemiş aidatları saydığında, sadece "Ödenmedi" durumundakileri say
                                        4. Tutarları TL cinsinden belirt
                                        5. Türkçe ve kısa cevap ver (maksimum 3-4 cümle)
                                        """,
                                        aidatlar.size(),
                                        aidatMetni,
                                        soru);

                        String cevap = geminiServisi.metinUret(prompt);

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "soru", soru,
                                        "cevap", cevap));

                } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Hata: " + e.getMessage()));
                }
        }

        /**
         * Harcamalar hakkında Gemini'ye soru sor
         */
        @PostMapping("/harcama-soru")
        public ResponseEntity<?> harcamaSoru(@RequestBody Map<String, String> request) {
                try {
                        String soru = request.get("soru");

                        if (soru == null || soru.isEmpty()) {
                                return ResponseEntity.badRequest().body(Map.of(
                                                "success", false,
                                                "message", "Soru boş olamaz"));
                        }

                        List<Harcama> harcamalar = harcamaServisi.tumHarcamalariGetir();

                        if (harcamalar.isEmpty()) {
                                return ResponseEntity.ok(Map.of(
                                                "success", true,
                                                "soru", soru,
                                                "cevap", "Sistemde henüz harcama kaydı bulunmamaktadır."));
                        }

                        // Son 10 harcamayı al (çok uzun olmasın diye)
                        List<Harcama> sonHarcamalar = harcamalar.stream()
                                        .sorted((h1, h2) -> h2.getTarih().compareTo(h1.getTarih()))
                                        .limit(10)
                                        .collect(Collectors.toList());

                        String harcamaMetni = sonHarcamalar.stream()
                                        .map(h -> String.format("""
                                                        - Başlık: %s
                                                        - Tutar: %.2f TL
                                                        - Kategori: %s
                                                        - Tarih: %s
                                                        - Açıklama: %s
                                                        """,
                                                        h.getBaslik(),
                                                        h.getTutar(),
                                                        h.getKategori(),
                                                        h.getTarih().toString(),
                                                        h.getAciklama() != null ? h.getAciklama() : "Yok"))
                                        .collect(Collectors.joining("\n---\n"));

                        double toplamTutar = harcamalar.stream()
                                        .mapToDouble(Harcama::getTutar)
                                        .sum();

                        String prompt = String.format(
                                        """
                                                        SEN BİR SİTE YÖNETİM ASİSTANISIN.

                                                        ÖNEMLİ KURAL: SADECE AŞAĞIDAKİ VERİLERİ KULLAN. KENDI BİLGİLERİNİ EKLEME!

                                                        SİSTEMDEKİ SON 10 HARCAMA (Toplam %d harcama var):
                                                        %s

                                                        TOPLAM HARCAMA: %.2f TL

                                                        KULLANICI SORUSU: %s

                                                        CEVAP KURALLARI:
                                                        1. Sadece yukarıdaki harcamaları kullan
                                                        2. Uydurma bilgi verme (örneğin bizim sistemde olmayan "elektrik", "su" gibi harcamalar yaratma)
                                                        3. En son harcama dediğinde, en üstteki (en yeni tarihli) harcamayı göster
                                                        4. Tutarları TL cinsinden belirt
                                                        5. Tarih formatını koru (yyyy-aa-gg)
                                                        6. Türkçe ve kısa cevap ver (maksimum 3-4 cümle)
                                                        """,
                                        harcamalar.size(),
                                        harcamaMetni,
                                        toplamTutar,
                                        soru);

                        String cevap = geminiServisi.metinUret(prompt);

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "soru", soru,
                                        "cevap", cevap));

                } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Hata: " + e.getMessage()));
                }
        }

        /**
         * Genel soru (AI asistan) - TÜM VERİLERLE
         */
        @PostMapping("/soru")
        public ResponseEntity<?> genelSoru(@RequestBody Map<String, String> request) {
                try {
                        String soru = request.get("soru");

                        if (soru == null || soru.isEmpty()) {
                                return ResponseEntity.badRequest().body(Map.of(
                                                "success", false,
                                                "message", "Soru boş olamaz"));
                        }

                        // TÜM veritabanı verilerini topla
                        List<Duyuru> duyurular = duyuruServisi.tumDuyurulariGetir();
                        List<Aidat> aidatlar = aidatServisi.tumAidatlariGetir();
                        List<Harcama> harcamalar = harcamaServisi.tumHarcamalariGetir();

                        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
                        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");

                        // ===== KULLANICILARI FORMATLA =====
                        List<Kullanici> kullanicilar = kullaniciServisi.tumKullanicilariGetir();
                        long adminSayisi = kullanicilar.stream()
                                        .filter(k -> k.getRolu() == Kullanici.KullaniciRolu.ADMIN).count();
                        long normalKullaniciSayisi = kullanicilar.stream()
                                        .filter(k -> k.getRolu() == Kullanici.KullaniciRolu.KULLANICI).count();

                        String kullaniciMetni = kullanicilar.isEmpty() ? "Henüz kullanıcı yok."
                                        : kullanicilar.stream()
                                                        .map(k -> String.format("[KULLANICI #%d] %s (%s) - Rol: %s",
                                                                        k.getId(),
                                                                        k.getAdSoyad(),
                                                                        k.getEmail(),
                                                                        k.getRolu().getDisplayValue()))
                                                        .collect(Collectors.joining("\n"));

                        // ===== DUYURULARI FORMATLA (ANKET OYLARI DAHİL) =====
                        String duyuruMetni = duyurular.isEmpty() ? "Henüz duyuru yok."
                                        : duyurular.stream()
                                                        .map(d -> {
                                                                StringBuilder sb = new StringBuilder();
                                                                sb.append(String.format("""
                                                                                [DUYURU #%d]
                                                                                - Başlık: %s
                                                                                - İçerik: %s
                                                                                - Tarih: %s
                                                                                - Önemli mi: %s
                                                                                - Anket mi: %s""",
                                                                                d.getId(),
                                                                                d.getBaslik(),
                                                                                d.getIcerik(),
                                                                                d.getOlusturmaTarihi().format(
                                                                                                dateTimeFormatter),
                                                                                d.isOnemli() ? "Evet" : "Hayır",
                                                                                d.isAnketMi() ? "Evet" : "Hayır"));

                                                                // Anket seçenekleri ve oyları ekle
                                                                if (d.isAnketMi()
                                                                                && !d.getAnketSecenekleri().isEmpty()) {
                                                                        sb.append("\n                                    - Anket Seçenekleri ve Oylar:");
                                                                        List<String> secenekler = d
                                                                                        .getAnketSecenekleri();
                                                                        Map<String, Integer> oylar = d.getOylar();

                                                                        for (int i = 0; i < secenekler.size(); i++) {
                                                                                final int index = i;
                                                                                long oySayisi = oylar.values().stream()
                                                                                                .filter(v -> v == index)
                                                                                                .count();
                                                                                sb.append(String.format(
                                                                                                "\n                                      * %s: %d oy",
                                                                                                secenekler.get(i),
                                                                                                oySayisi));
                                                                        }
                                                                        sb.append(String.format(
                                                                                        "\n                                    - Toplam oy kullanan: %d kişi",
                                                                                        oylar.size()));
                                                                }
                                                                sb.append("\n");
                                                                return sb.toString();
                                                        })
                                                        .collect(Collectors.joining("\n"));

                        // ===== AİDATLARI FORMATLA =====
                        String aidatMetni = aidatlar.isEmpty() ? "Henüz aidat kaydı yok."
                                        : aidatlar.stream()
                                                        .map(a -> String.format("""
                                                                        [AİDAT #%d]
                                                                        - Dönem: %s
                                                                        - Tutar: %.2f TL
                                                                        - Durum: %s
                                                                        - Ödeme Tarihi: %s
                                                                        """,
                                                                        a.getId(),
                                                                        a.getDonem() != null ? a.getDonem()
                                                                                        : (a.getAy() + " "
                                                                                                        + a.getYil()),
                                                                        a.getTutar(),
                                                                        a.getDurum().getDisplayValue(),
                                                                        a.getOdemeTarihi() != null
                                                                                        ? a.getOdemeTarihi().format(
                                                                                                        dateFormatter)
                                                                                        : "Henüz ödenmedi"))
                                                        .collect(Collectors.joining("\n"));

                        // ===== HARCAMALARI FORMATLA =====
                        String harcamaMetni = harcamalar.isEmpty() ? "Henüz harcama kaydı yok."
                                        : harcamalar.stream()
                                                        .map(h -> String.format("""
                                                                        [HARCAMA #%d]
                                                                        - Başlık: %s
                                                                        - Tutar: %.2f TL
                                                                        - Kategori: %s
                                                                        - Tarih: %s
                                                                        - Açıklama: %s
                                                                        """,
                                                                        h.getId(),
                                                                        h.getBaslik(),
                                                                        h.getTutar(),
                                                                        h.getKategori(),
                                                                        h.getTarih().format(dateFormatter),
                                                                        h.getAciklama() != null ? h.getAciklama()
                                                                                        : "Yok"))
                                                        .collect(Collectors.joining("\n"));

                        // Toplam tutarları hesapla
                        double toplamAidat = aidatlar.stream().mapToDouble(Aidat::getTutar).sum();
                        double odenmisAidat = aidatlar.stream()
                                        .filter(a -> a.getDurum() == Aidat.AidatDurumu.ODENDI)
                                        .mapToDouble(Aidat::getTutar).sum();
                        double odenmemisAidat = toplamAidat - odenmisAidat;
                        double toplamHarcama = harcamalar.stream().mapToDouble(Harcama::getTutar).sum();

                        String prompt = String.format("""
                                        SEN BİR SİTE YÖNETİM ASİSTANISIN VE TÜM VERİLERE ERİŞİMİN VAR.

                                        ====== SİSTEMDEKİ TÜM VERİLER ======

                                        👥 KULLANICILAR (%d adet - %d Yönetici, %d Site Sakini):
                                        %s

                                        📢 DUYURULAR (%d adet):
                                        %s

                                        💰 AİDATLAR (%d adet):
                                        %s

                                        📊 HARCAMALAR (%d adet):
                                        %s

                                        ====== ÖZET İSTATİSTİKLER ======
                                        - Toplam Aidat Tutarı: %.2f TL
                                        - Ödenen Aidat: %.2f TL
                                        - Ödenmeyen Aidat: %.2f TL
                                        - Toplam Harcama: %.2f TL

                                        ====== KULLANICI SORUSU ======
                                        %s

                                        ====== CEVAP KURALLARI ======
                                        1. SADECE yukarıdaki verileri kullan, KENDİ BİLGİLERİNİ EKLEME
                                        2. Kullanıcı ne sorarsa eksiksiz ve detaylı cevap ver
                                        3. "Başka endpoint kullan" veya "detaylara erişemiyorum" gibi şeyler SÖYLEME
                                        4. Eğer "son duyuru" denirse, en son tarihli duyuruyu göster
                                        5. Eğer "tüm duyurular" denirse, hepsini listele
                                        6. Türkçe, samimi ve yardımsever bir dille cevap ver
                                        7. Eğer veri yoksa "Sistemde henüz ... bulunmuyor" de
                                        8. Tarihleri "gg.aa.yyyy" formatında göster
                                        9. Tutarları "X.XX TL" formatında göster
                                        """,
                                        kullanicilar.size(),
                                        adminSayisi,
                                        normalKullaniciSayisi,
                                        kullaniciMetni,
                                        duyurular.size(),
                                        duyuruMetni,
                                        aidatlar.size(),
                                        aidatMetni,
                                        harcamalar.size(),
                                        harcamaMetni,
                                        toplamAidat,
                                        odenmisAidat,
                                        odenmemisAidat,
                                        toplamHarcama,
                                        soru);

                        String cevap = geminiServisi.metinUret(prompt);

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "soru", soru,
                                        "cevap", cevap));

                } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of(
                                        "success", false,
                                        "message", "Hata: " + e.getMessage()));
                }
        }

        /**
         * Aidat ihbarnamesi için taslak metin üret
         */
        @PostMapping("/ihbarname-taslak")
        public ResponseEntity<?> ihbarnameTaslak(@RequestBody Map<String, Long> request) {
                try {
                        Long aidatId = request.get("aidatId");
                        if (aidatId == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("success", false, "message", "aidatId eksik"));
                        }

                        Aidat aidat = aidatServisi.idIleAidatBul(aidatId).orElse(null);
                        if (aidat == null) {
                                return ResponseEntity.status(404)
                                                .body(Map.of("success", false, "message", "Aidat bulunamadı"));
                        }

                        String taslak = geminiServisi.ihbarnameMetniOlustur(aidat.getDonem(), aidat.getTutar());

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "data", Map.of(
                                                        "baslik", "Hatırlatma: " + aidat.getDonem() + " Aidat Ödemesi",
                                                        "icerik", taslak,
                                                        "aidatId", aidatId)));
                } catch (Exception e) {
                        return ResponseEntity.status(500)
                                        .body(Map.of("success", false, "message", "Hata: " + e.getMessage()));
                }
        }
}
