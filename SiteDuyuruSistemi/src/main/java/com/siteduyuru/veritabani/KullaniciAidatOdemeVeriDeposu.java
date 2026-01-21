package com.siteduyuru.veritabani;

import com.siteduyuru.model.KullaniciAidatOdeme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KullaniciAidatOdemeVeriDeposu extends JpaRepository<KullaniciAidatOdeme, Long> {

    // Aidata ait tüm ödemeleri getir
    List<KullaniciAidatOdeme> findByAidatId(Long aidatId);

    // Kullanıcının tüm ödemelerini getir
    List<KullaniciAidatOdeme> findByKullaniciId(Long kullaniciId);

    // Kullanıcının belirli bir aidat için ödemesi var mı?
    Optional<KullaniciAidatOdeme> findByKullaniciIdAndAidatId(Long kullaniciId, Long aidatId);

    // Email ile kontrol
    Optional<KullaniciAidatOdeme> findByKullaniciEmailAndAidatId(String email, Long aidatId);

    // Aidata ait ödeme sayısını getir
    long countByAidatId(Long aidatId);

    // Aidata ait ödeme var mı?
    boolean existsByKullaniciIdAndAidatId(Long kullaniciId, Long aidatId);
}
