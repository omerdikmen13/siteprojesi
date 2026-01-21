package com.siteduyuru.servis;

import com.siteduyuru.model.Aidat;
import com.siteduyuru.veritabani.AidatVeriDeposu;
import com.siteduyuru.veritabani.KullaniciAidatOdemeVeriDeposu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AidatServisi {

    @Autowired
    private AidatVeriDeposu aidatVeriDeposu;

    @Autowired
    private KullaniciAidatOdemeVeriDeposu odemeVeriDeposu;

    public Aidat aidatKaydet(Aidat aidat) {
        return aidatVeriDeposu.save(aidat);
    }

    public List<Aidat> tumAidatlariGetir() {
        return aidatVeriDeposu.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public Optional<Aidat> idIleAidatBul(Long id) {
        return aidatVeriDeposu.findById(id);
    }

    public void aidatSil(Long id) {
        // Önce bu aidata ait ödeme kayıtlarını temizle (FK kısıtlaması varsa hata
        // önlenir)
        // Eğer veritabanında fiziksel FK yoksa bile veri bütünlüğü için gereklidir.
        odemeVeriDeposu.deleteAll(odemeVeriDeposu.findByAidatId(id));
        aidatVeriDeposu.deleteById(id);
    }
}
