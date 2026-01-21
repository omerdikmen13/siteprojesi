package com.siteduyuru.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mesajlar")
public class Mesaj {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long gonderenId;

    @Column(nullable = true) // null ise GENEL bildirim olabilir (ADMIN_TO_ALL)
    private Long aliciId;

    @Column(nullable = false)
    private String baslik;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String icerik;

    @Column(nullable = false)
    private LocalDateTime tarih = LocalDateTime.now();

    @Column(nullable = false)
    private boolean okundu = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MesajTipi tip;

    @Column(nullable = true)
    private Long anaMesajId; // Threading için ana mesajın ID'si

    @Column(nullable = false)
    private boolean silindi = false; // Mesajın içeriği silindi mi?

    @Column(nullable = false)
    private boolean gonderenSildi = false; // Gönderen kendi listesinden sildi mi?

    @Column(nullable = false)
    private boolean aliciSildi = false; // Alıcı kendi listesinden sildi mi?

    public enum MesajTipi {
        USER_TO_ADMIN,
        ADMIN_TO_USER,
        ADMIN_TO_ALL
    }

    // ===== GETTER & SETTER =====

    public Long getAnaMesajId() {
        return anaMesajId;
    }

    public void setAnaMesajId(Long anaMesajId) {
        this.anaMesajId = anaMesajId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGonderenId() {
        return gonderenId;
    }

    public void setGonderenId(Long gonderenId) {
        this.gonderenId = gonderenId;
    }

    public Long getAliciId() {
        return aliciId;
    }

    public void setAliciId(Long aliciId) {
        this.aliciId = aliciId;
    }

    public String getBaslik() {
        return baslik;
    }

    public void setBaslik(String baslik) {
        this.baslik = baslik;
    }

    public String getIcerik() {
        return icerik;
    }

    public void setIcerik(String icerik) {
        this.icerik = icerik;
    }

    public LocalDateTime getTarih() {
        return tarih;
    }

    public void setTarih(LocalDateTime tarih) {
        this.tarih = tarih;
    }

    public boolean isOkundu() {
        return okundu;
    }

    public void setOkundu(boolean okundu) {
        this.okundu = okundu;
    }

    public MesajTipi getTip() {
        return tip;
    }

    public void setTip(MesajTipi tip) {
        this.tip = tip;
    }

    public boolean isSilindi() {
        return silindi;
    }

    public void setSilindi(boolean silindi) {
        this.silindi = silindi;
    }

    public boolean isGonderenSildi() {
        return gonderenSildi;
    }

    public void setGonderenSildi(boolean gonderenSildi) {
        this.gonderenSildi = gonderenSildi;
    }

    public boolean isAliciSildi() {
        return aliciSildi;
    }

    public void setAliciSildi(boolean aliciSildi) {
        this.aliciSildi = aliciSildi;
    }
}
