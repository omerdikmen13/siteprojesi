package com.siteduyuru.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kullanicilar")
public class Kullanici {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adSoyad;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String sifre;

    @Enumerated(EnumType.STRING)
    private KullaniciRolu rolu = KullaniciRolu.KULLANICI;

    // ⭐ YENİ ALAN: Daire Numarası
    @Column(nullable = true)
    private String daireNo;

    public enum KullaniciRolu {
        ADMIN("Yönetici"),
        KULLANICI("Site Sakini");

        private final String displayValue;

        KullaniciRolu(String displayValue) {
            this.displayValue = displayValue;
        }

        public String getDisplayValue() {
            return displayValue;
        }
    }

    // ===== GETTER & SETTER =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSifre() {
        return sifre;
    }

    public void setSifre(String sifre) {
        this.sifre = sifre;
    }

    public KullaniciRolu getRolu() {
        return rolu;
    }

    public void setRolu(KullaniciRolu rolu) {
        this.rolu = rolu;
    }

    // ⭐ YENİ GETTER & SETTER
    public String getDaireNo() {
        return daireNo;
    }

    public void setDaireNo(String daireNo) {
        this.daireNo = daireNo;
    }
}
