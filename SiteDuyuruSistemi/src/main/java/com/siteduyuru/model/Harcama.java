package com.siteduyuru.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "harcamalar")
public class Harcama {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String baslik;
    private String aciklama;
    private Double tutar;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tarih = LocalDate.now();
    
    // Mobil uygulama için kategori field'ı
    private String kategori = "Genel"; // Varsayılan: Genel

    // Getter ve Setter'lar
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getBaslik() { return baslik; }
    public void setBaslik(String baslik) { this.baslik = baslik; }
    
    public String getAciklama() { return aciklama; }
    public void setAciklama(String aciklama) { this.aciklama = aciklama; }
    
    public Double getTutar() { return tutar; }
    public void setTutar(Double tutar) { this.tutar = tutar; }
    
    public LocalDate getTarih() { return tarih; }
    public void setTarih(LocalDate tarih) { this.tarih = tarih; }
    
    public String getKategori() { return kategori; }
    public void setKategori(String kategori) { this.kategori = kategori; }
}