package com.siteduyuru.servis;

import com.siteduyuru.model.Duyuru;
import com.siteduyuru.veritabani.DuyuruVeriDeposu;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Duyuru Servisi - Duyuru CRUD işlemleri ve email bildirimleri
 * 
 * Yeni duyuru kaydedildiğinde otomatik olarak tüm kullanıcılara
 * email bildirimi gönderilir (MailServisi aracılığıyla).
 */
@Service
public class DuyuruServisi {

    private final DuyuruVeriDeposu duyuruVeriDeposu;
    private final MailServisi mailServisi;

    public DuyuruServisi(DuyuruVeriDeposu duyuruVeriDeposu, MailServisi mailServisi) {
        this.duyuruVeriDeposu = duyuruVeriDeposu;
        this.mailServisi = mailServisi;
    }

    @Transactional(readOnly = true)
    public List<Duyuru> tumDuyurulariGetir() {
        return duyuruVeriDeposu.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    /**
     * Duyuru kaydeder ve tüm kullanıcılara email bildirimi gönderir
     * 
     * @param duyuru Kaydedilecek duyuru
     * @return Kaydedilen duyuru
     */
    @Transactional
    public Duyuru duyuruKaydet(Duyuru duyuru) {
        // Yeni duyuru mu kontrol et (id yoksa yeni)
        boolean yeniDuyuru = (duyuru.getId() == null);

        // Duyuruyu kaydet
        Duyuru kaydedilenDuyuru = duyuruVeriDeposu.save(duyuru);

        // Yeni duyuru ise tüm kullanıcılara email gönder
        if (yeniDuyuru) {
            System.out.println("📢 Yeni duyuru oluşturuldu: " + kaydedilenDuyuru.getBaslik());
            System.out.println("📧 Email bildirimi gönderiliyor...");

            // Asenkron olarak email bildirimi gönder (ana işlemi bloklamaz)
            mailServisi.tumKullaniciaraDuyuruGonder(kaydedilenDuyuru);
        }

        return kaydedilenDuyuru;
    }

    @Transactional(readOnly = true)
    public Optional<Duyuru> idIleDuyuruBul(Long id) {
        return duyuruVeriDeposu.findById(id);
    }

    @Transactional
    public void duyuruSil(Long id) {
        duyuruVeriDeposu.deleteById(id);
    }
}