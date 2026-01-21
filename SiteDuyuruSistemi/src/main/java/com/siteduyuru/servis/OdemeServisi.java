package com.siteduyuru.servis;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.model.Kullanici;
import com.siteduyuru.model.KullaniciAidatOdeme;
import com.siteduyuru.veritabani.KullaniciAidatOdemeVeriDeposu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Ödeme servisi.
 * Stripe entegrasyonu ile aidat ödemelerini yönetir.
 */
@Service
public class OdemeServisi {

    @Autowired
    private KullaniciAidatOdemeVeriDeposu kullaniciAidatOdemeVeriDeposu;

    @Autowired
    private AidatServisi aidatServisi;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    /**
     * Stripe PaymentIntent oluştur.
     */
    public String odemeNiyetiOlustur(Long aidatId, Double tutar, String email) throws Exception {
        // Tutar kuruş cinsinden olmalı (TRY için 100 ile çarp)
        // Minimum tutar kontrolü eklenebilir
        long amountInCents = (long) (tutar * 100);

        com.stripe.param.PaymentIntentCreateParams params = com.stripe.param.PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("try")
                .setReceiptEmail(email)
                .putMetadata("aidatId", aidatId.toString())
                .putMetadata("email", email)
                .setAutomaticPaymentMethods(
                        com.stripe.param.PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .build();

        com.stripe.model.PaymentIntent intent = com.stripe.model.PaymentIntent.create(params);
        return intent.getClientSecret();
    }

    /**
     * Ödeme başarılı olduğunda veritabanına işle (Mobile'den gelen onay sonrası
     * çağrılır)
     * Veya Webhook ile yapılabilir. Şimdilik manuel onay endpoint'i kullanalım.
     */
    public void odemeBasariliIsle(Long aidatId, Long kullaniciId, Double tutar, String stripePaymentId) {
        // Mükerrer kontrol
        if (kullaniciAidatOdemeVeriDeposu.existsByKullaniciIdAndAidatId(kullaniciId, aidatId)) {
            return;
        }

        // Kullanıcı bilgisini bul
        Optional<Kullanici> k = kullaniciServisi.idIleKullaniciBul(kullaniciId);
        String email = k.map(Kullanici::getEmail).orElse("unknown@domain.com");
        String daireNo = k.map(Kullanici::getDaireNo).orElse("-");

        // Kayıt oluştur
        KullaniciAidatOdeme kayit = new KullaniciAidatOdeme();
        kayit.setAidatId(aidatId);
        kayit.setKullaniciId(kullaniciId);
        kayit.setKullaniciEmail(email);
        kayit.setKullaniciDaireNo(daireNo);
        kayit.setOdenenTutar(tutar);
        kayit.setOdemeReferansNo(stripePaymentId); // Stripe ID'si
        kayit.setOdemeTarihi(LocalDateTime.now());

        kullaniciAidatOdemeVeriDeposu.save(kayit);

        // Aidat durumunu güncelle
        tumDairelerOdediMiKontrolEt(aidatId);
    }

    /**
     * Tüm daireler ödedi mi kontrol et.
     * Eğer tüm daireler ödediyse aidat durumunu ODENDI yap.
     */
    private void tumDairelerOdediMiKontrolEt(Long aidatId) {
        Optional<Aidat> aidatOpt = aidatServisi.idIleAidatBul(aidatId);
        if (aidatOpt.isPresent()) {
            Aidat aidat = aidatOpt.get();
            int daireSayisi = aidat.getDaireSayisi() != null ? aidat.getDaireSayisi() : 1;
            long odeyenSayisi = kullaniciAidatOdemeVeriDeposu.countByAidatId(aidatId);

            // Tüm daireler ödediyse durumu güncelle
            if (odeyenSayisi >= daireSayisi) {
                aidat.setDurum(Aidat.AidatDurumu.ODENDI);
                aidatServisi.aidatKaydet(aidat);
            }
        }
    }

    /**
     * Aidata ait ödeme istatistiklerini getir.
     */
    public OdemeIstatistik aidatOdemeIstatistik(Long aidatId) {
        Optional<Aidat> aidatOpt = aidatServisi.idIleAidatBul(aidatId);
        if (aidatOpt.isEmpty()) {
            return new OdemeIstatistik(0, 0, 0, 0.0);
        }

        Aidat aidat = aidatOpt.get();
        int daireSayisi = aidat.getDaireSayisi() != null ? aidat.getDaireSayisi() : 1;
        List<KullaniciAidatOdeme> odeyenler = kullaniciAidatOdemeVeriDeposu.findByAidatId(aidatId);
        long odeyenSayisi = odeyenler.size();
        double toplamToplanan = odeyenler.stream().mapToDouble(KullaniciAidatOdeme::getOdenenTutar).sum();

        return new OdemeIstatistik(daireSayisi, (int) odeyenSayisi, daireSayisi - (int) odeyenSayisi, toplamToplanan);
    }

    /**
     * Aidata ait ödeyen kullanıcıları getir.
     */
    public List<KullaniciAidatOdeme> aidatOdeyenler(Long aidatId) {
        return kullaniciAidatOdemeVeriDeposu.findByAidatId(aidatId);
    }

    /**
     * Henüz ödeme yapmamış kullanıcıları getir (Sadece Sakinler).
     */
    public List<Kullanici> borcluKullanicilar(Long aidatId) {
        List<Kullanici> tumSakinler = kullaniciServisi.tumKullanicilariGetir().stream()
                .filter(k -> k.getRolu() == Kullanici.KullaniciRolu.KULLANICI)
                .collect(java.util.stream.Collectors.toList());

        List<Long> odeyenIdleri = kullaniciAidatOdemeVeriDeposu.findByAidatId(aidatId).stream()
                .map(KullaniciAidatOdeme::getKullaniciId)
                .collect(java.util.stream.Collectors.toList());

        return tumSakinler.stream()
                .filter(k -> !odeyenIdleri.contains(k.getId()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Kullanıcı belirli bir aidatı ödemiş mi?
     */
    public boolean kullaniciOdediMi(Long kullaniciId, Long aidatId) {
        return kullaniciAidatOdemeVeriDeposu.existsByKullaniciIdAndAidatId(kullaniciId, aidatId);
    }

    public static class OdemeIstatistik {
        public int toplamDaire;
        public int odeyenSayisi;
        public int odemeyenSayisi;
        public double toplamToplanan;

        public OdemeIstatistik(int toplamDaire, int odeyenSayisi, int odemeyenSayisi, double toplamToplanan) {
            this.toplamDaire = toplamDaire;
            this.odeyenSayisi = odeyenSayisi;
            this.odemeyenSayisi = odemeyenSayisi;
            this.toplamToplanan = toplamToplanan;
        }
    }
}
