package com.siteduyuru.servis;

import com.siteduyuru.model.Kullanici;
import com.siteduyuru.model.SikayetOneri;
import com.siteduyuru.veritabani.SikayetOneriVeriDeposu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SikayetOneriServisi {

    @Autowired
    private SikayetOneriVeriDeposu repository;

    @Autowired
    private KullaniciServisi kullaniciServisi;

    public SikayetOneri kaydet(SikayetOneri sikayetOneri) {
        // Kullanıcı bilgilerini zenginleştir
        Optional<Kullanici> kullanici = kullaniciServisi.idIleKullaniciBul(sikayetOneri.getKullaniciId());
        if (kullanici.isPresent()) {
            Kullanici k = kullanici.get();
            sikayetOneri.setKullaniciAdSoyad(k.getAdSoyad());
            sikayetOneri.setKullaniciEmail(k.getEmail());
            sikayetOneri.setKullaniciDaireNo(k.getDaireNo());
        }
        return repository.save(sikayetOneri);
    }

    public List<SikayetOneri> tumunuGetir() {
        return repository.findAll();
    }

    public List<SikayetOneri> kullaniciSikayetleri(Long kullaniciId) {
        return repository.findByKullaniciIdOrderByOlusturmaTarihiDesc(kullaniciId);
    }

    public Optional<SikayetOneri> idIleBul(Long id) {
        if (id == null)
            return Optional.empty();
        return repository.findById(id);
    }

    public void sil(Long id) {
        if (id != null) {
            repository.deleteById(id);
        }
    }

    public SikayetOneri durumGuncelle(Long id, SikayetOneri.Durum yeniDurum, String adminNotu) {
        if (id == null)
            return null;
        Optional<SikayetOneri> opt = repository.findById(id);
        if (opt.isPresent()) {
            SikayetOneri s = opt.get();
            s.setDurum(yeniDurum);
            if (adminNotu != null) {
                s.setAdminNotu(adminNotu);
            }
            return repository.save(s);
        }
        return null;
    }
}
