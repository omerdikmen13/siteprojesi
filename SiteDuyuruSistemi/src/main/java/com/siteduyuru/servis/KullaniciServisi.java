package com.siteduyuru.servis;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.veritabani.KullaniciVeriDeposu;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class KullaniciServisi {

    private final KullaniciVeriDeposu kullaniciVeriDeposu;

    public KullaniciServisi(KullaniciVeriDeposu kullaniciVeriDeposu) {
        this.kullaniciVeriDeposu = kullaniciVeriDeposu;
    }

    public List<Kullanici> tumKullanicilariGetir() {
        return kullaniciVeriDeposu.findAll();
    }

    public Kullanici kullaniciKaydet(Kullanici kullanici) {
        return kullaniciVeriDeposu.save(kullanici);
    }

    public void kullaniciSil(Long id) {
        kullaniciVeriDeposu.deleteById(id);
    }

    public Kullanici emailIleBul(String email) {
        return kullaniciVeriDeposu.findByEmail(email).orElse(null);
    }

    // ✅ EKLENEN METOT (Optional döner)
    public Optional<Kullanici> idIleKullaniciBul(Long id) {
        return kullaniciVeriDeposu.findById(id);
    }

    // ✅ Mevcut kullanım için güvenli metot (exception atan)
    public Kullanici idIleGetir(Long id) {
        return kullaniciVeriDeposu.findById(id)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı, ID: " + id));
    }
}
