package com.siteduyuru.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Kullanıcıların hangi aidatı ödediğini takip eden ara tablo.
 * Her kullanıcı her aidat için ayrı bir kayıt oluşturur.
 */
@Entity
@Table(name = "kullanici_aidat_odemeleri")
public class KullaniciAidatOdeme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ödeme yapan kullanıcı
    @Column(nullable = false)
    private Long kullaniciId;

    private String kullaniciEmail;
    private String kullaniciDaireNo;

    // Ödenen aidat
    @Column(nullable = false)
    private Long aidatId;

    // Ödeme bilgileri
    private Double odenenTutar;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime odemeTarihi;

    // Ödeme referans numarası (OdemeSimulasyonu ile bağlantı)
    private String odemeReferansNo;

    // Ödeme durumu
    @Enumerated(EnumType.STRING)
    private OdemeDurumu durum = OdemeDurumu.ODENDI;

    public enum OdemeDurumu {
        ODENDI("Ödendi"),
        IPTAL("İptal Edildi");

        private final String displayValue;

        OdemeDurumu(String displayValue) {
            this.displayValue = displayValue;
        }

        public String getDisplayValue() {
            return displayValue;
        }
    }

    // Constructor
    public KullaniciAidatOdeme() {
        this.odemeTarihi = LocalDateTime.now();
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

    public Long getAidatId() {
        return aidatId;
    }

    public void setAidatId(Long aidatId) {
        this.aidatId = aidatId;
    }

    public Double getOdenenTutar() {
        return odenenTutar;
    }

    public void setOdenenTutar(Double odenenTutar) {
        this.odenenTutar = odenenTutar;
    }

    public LocalDateTime getOdemeTarihi() {
        return odemeTarihi;
    }

    public void setOdemeTarihi(LocalDateTime odemeTarihi) {
        this.odemeTarihi = odemeTarihi;
    }

    public String getOdemeReferansNo() {
        return odemeReferansNo;
    }

    public void setOdemeReferansNo(String odemeReferansNo) {
        this.odemeReferansNo = odemeReferansNo;
    }

    public OdemeDurumu getDurum() {
        return durum;
    }

    public void setDurum(OdemeDurumu durum) {
        this.durum = durum;
    }
}
