package com.siteduyuru.veritabani;

import com.siteduyuru.model.Harcama;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HarcamaVeriDeposu extends JpaRepository<Harcama, Long> {
}
