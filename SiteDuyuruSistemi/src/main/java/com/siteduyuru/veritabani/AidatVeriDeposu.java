package com.siteduyuru.veritabani;

import com.siteduyuru.model.Aidat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AidatVeriDeposu extends JpaRepository<Aidat, Long> {
}
