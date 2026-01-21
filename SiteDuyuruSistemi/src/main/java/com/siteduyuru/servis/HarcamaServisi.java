package com.siteduyuru.servis;

import com.siteduyuru.model.Harcama;
import com.siteduyuru.veritabani.HarcamaVeriDeposu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HarcamaServisi {

    @Autowired
    private HarcamaVeriDeposu harcamaVeriDeposu;

    public Harcama harcamaKaydet(Harcama harcama) {
        return harcamaVeriDeposu.save(harcama);
    }

    public List<Harcama> tumHarcamalariGetir() {
        return harcamaVeriDeposu.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // ✅ DETAY İÇİN NET METOT
    public Harcama idIleHarcamaGetir(Long id) {
        return harcamaVeriDeposu.findById(id)
                .orElseThrow(() -> new RuntimeException("Harcama bulunamadı: " + id));
    }

    public void harcamaSil(Long id) {
        harcamaVeriDeposu.deleteById(id);
    }
}
