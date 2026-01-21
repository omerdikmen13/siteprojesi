package com.siteduyuru.veritabani;

import com.siteduyuru.model.Kullanici;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KullaniciVeriDeposu extends JpaRepository<Kullanici, Long> {

    // Güvenlik ve login işlemleri için
    Optional<Kullanici> findByEmail(String email);
}
