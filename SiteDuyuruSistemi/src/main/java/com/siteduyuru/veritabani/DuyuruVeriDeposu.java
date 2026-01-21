package com.siteduyuru.veritabani;

import com.siteduyuru.model.Duyuru;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DuyuruVeriDeposu extends JpaRepository<Duyuru, Long> {
}
