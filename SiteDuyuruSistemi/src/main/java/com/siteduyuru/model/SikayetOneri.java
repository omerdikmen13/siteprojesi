package com.siteduyuru.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Şikayet ve Öneri entity sınıfı.
 */
@Entity
@Table(name = "sikayet_oneriler")
public class SikayetOneri {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long kullaniciId;

    private String kullaniciAdSoyad;
    private String kullaniciEmail;
    private String kullaniciDaireNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tur tur = Tur.SIKAYET;

    @Column(nullable = false)
    private String baslik;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String aciklama;

    private String kategori;

    @Enumerated(EnumType.STRING)
    private Durum durum = Durum.BEKLEMEDE;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime olusturmaTarihi;

    private String adminNotu;

    public enum Tur {
        SIKAYET("Şikayet"),
        ONERI("Öneri");

        private final String displayValue;

        Tur(String displayValue) {
            this.displayValue = displayValue;
        }

        public String getDisplayValue() {
            return displayValue;
        }
    }

    public enum Durum {
        BEKLEMEDE("Beklemede"),
        INCELENIYOR("İnceleniyor"),
        COZULDU("Çözüldü"),
        REDDEDILDI("Reddedildi");

        private final String displayValue;

        Durum(String displayValue) {
            this.displayValue = displayValue;
        }

        public String getDisplayValue() {
            return displayValue;
        }
    }

    public SikayetOneri() {
        this.olusturmaTarihi = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getKullaniciId() {
        return kullaniciId;
    }

    public void setKullaniciId(Long kullaniciId) {
        this.kullaniciId = kullaniciId;
    }

    public String getKullaniciAdSoyad() {
        return kullaniciAdSoyad;
    }

    public void setKullaniciAdSoyad(String kullaniciAdSoyad) {
        this.kullaniciAdSoyad = kullaniciAdSoyad;
    }

    public String getKullaniciEmail() {
        return kullaniciEmail;
    }

    public void setKullaniciEmail(String kullaniciEmail) {
        this.kullaniciEmail = kullaniciEmail;
    }

    public String getKullaniciDaireNo() {
        return kullaniciDaireNo;
    }

    public void setKullaniciDaireNo(String kullaniciDaireNo) {
        this.kullaniciDaireNo = kullaniciDaireNo;
    }

    public Tur getTur() {
        return tur;
    }

    public void setTur(Tur tur) {
        this.tur = tur;
    }

    public String getBaslik() {
        return baslik;
    }

    public void setBaslik(String baslik) {
        this.baslik = baslik;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }

    public String getKategori() {
        return kategori;
    }

    public void setKategori(String kategori) {
        this.kategori = kategori;
    }

    public Durum getDurum() {
        return durum;
    }

    public void setDurum(Durum durum) {
        this.durum = durum;
    }

    public LocalDateTime getOlusturmaTarihi() {
        return olusturmaTarihi;
    }

    public void setOlusturmaTarihi(LocalDateTime olusturmaTarihi) {
        this.olusturmaTarihi = olusturmaTarihi;
    }

    public String getAdminNotu() {
        return adminNotu;
    }

    public void setAdminNotu(String adminNotu) {
        this.adminNotu = adminNotu;
    }
}
