package com.siteduyuru.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "aidatlar")
public class Aidat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mobil uygulamada "Ocak 2025" şeklinde göstermek için
    private String ay; // Örn: "Ocak", "Şubat"
    private Integer yil; // Örn: 2025

    // Eski alan için backward compatibility (opsiyonel)
    private String donem; // Örn: "Ocak 2025"

    private Double tutar;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 20")
    private Integer daireSayisi = 20; // Varsayılan daire sayısı

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate odemeTarihi;

    @Enumerated(EnumType.STRING)
    private AidatDurumu durum = AidatDurumu.ODENMEDI;

    public enum AidatDurumu {
        ODENDI("Ödendi"),
        ODENMEDI("Ödenmedi");

        private final String displayValue;

        AidatDurumu(String displayValue) {
            this.displayValue = displayValue;
        }

        public String getDisplayValue() {
            return displayValue;
        }
    }

    // Mobil için boolean getter
    public boolean isOdendi() {
        return this.durum == AidatDurumu.ODENDI;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAy() {
        return ay;
    }

    public void setAy(String ay) {
        this.ay = ay;
        updateDonem();
    }

    public Integer getYil() {
        return yil;
    }

    public void setYil(Integer yil) {
        this.yil = yil;
        updateDonem();
    }

    public String getDonem() {
        return donem;
    }

    public void setDonem(String donem) {
        this.donem = donem;
    }

    private void updateDonem() {
        if (ay != null && yil != null) {
            this.donem = ay + " " + yil;
        }
    }

    public Double getTutar() {
        return tutar;
    }

    public void setTutar(Double tutar) {
        this.tutar = tutar;
    }

    public Integer getDaireSayisi() {
        return daireSayisi;
    }

    public void setDaireSayisi(Integer daireSayisi) {
        this.daireSayisi = daireSayisi;
    }

    public LocalDate getOdemeTarihi() {
        return odemeTarihi;
    }

    public void setOdemeTarihi(LocalDate odemeTarihi) {
        this.odemeTarihi = odemeTarihi;
    }

    public AidatDurumu getDurum() {
        return durum;
    }

    public void setDurum(AidatDurumu durum) {
        this.durum = durum;
        if (durum == AidatDurumu.ODENDI && odemeTarihi == null) {
            this.odemeTarihi = LocalDate.now();
        }
    }
}