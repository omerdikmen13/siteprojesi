package com.siteduyuru.veritabani;

import com.siteduyuru.model.SikayetOneri;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SikayetOneriVeriDeposu extends JpaRepository<SikayetOneri, Long> {

    // Kullanıcının şikayet/önerilerini getir
    List<SikayetOneri> findByKullaniciIdOrderByOlusturmaTarihiDesc(Long kullaniciId);

    // Türüne göre getir
    List<SikayetOneri> findByTurOrderByOlusturmaTarihiDesc(SikayetOneri.Tur tur);

    // Durumuna göre getir
    List<SikayetOneri> findByDurumOrderByOlusturmaTarihiDesc(SikayetOneri.Durum durum);
}
