package com.siteduyuru.servis;

import com.siteduyuru.model.Duyuru;
import com.siteduyuru.veritabani.DuyuruVeriDeposu;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DuyuruServisi {

    private final DuyuruVeriDeposu duyuruVeriDeposu;

    public DuyuruServisi(DuyuruVeriDeposu duyuruVeriDeposu) {
        this.duyuruVeriDeposu = duyuruVeriDeposu;
    }

    @Transactional(readOnly = true) // Okuma güvenliği için eklendi
    public List<Duyuru> tumDuyurulariGetir() {
        return duyuruVeriDeposu.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Transactional
    public Duyuru duyuruKaydet(Duyuru duyuru) {
        return duyuruVeriDeposu.save(duyuru);
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