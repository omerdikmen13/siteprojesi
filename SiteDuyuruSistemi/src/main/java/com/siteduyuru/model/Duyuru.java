package com.siteduyuru.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "duyurular")
public class Duyuru {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String baslik;

    @Column(nullable = false, length = 2000)
    private String icerik;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime olusturmaTarihi = LocalDateTime.now();
    
    // Mobil için basit tarih field'ı
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    public LocalDateTime getTarih() {
        return olusturmaTarihi;
    }
    
    // Mobil için "onemli" field'ı
    private boolean onemli = false;

    private boolean anketMi = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "duyuru_anket_secenekleri", joinColumns = @JoinColumn(name = "duyuru_id"))
    @Column(name = "secenek_metni")
    private List<String> anketSecenekleri = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "duyuru_anket_oylari", joinColumns = @JoinColumn(name = "duyuru_id"))
    @MapKeyColumn(name = "kullanici_adi")
    @Column(name = "secenek_index")
    private Map<String, Integer> oylar = new HashMap<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getBaslik() { return baslik; }
    public void setBaslik(String baslik) { this.baslik = baslik; }
    
    public String getIcerik() { return icerik; }
    public void setIcerik(String icerik) { this.icerik = icerik; }
    
    public LocalDateTime getOlusturmaTarihi() { return olusturmaTarihi; }
    public void setOlusturmaTarihi(LocalDateTime olusturmaTarihi) { this.olusturmaTarihi = olusturmaTarihi; }
    
    public boolean isOnemli() { return onemli; }
    public void setOnemli(boolean onemli) { this.onemli = onemli; }
    
    public boolean isAnketMi() { return anketMi; }
    public void setAnketMi(boolean anketMi) { this.anketMi = anketMi; }
    
    public List<String> getAnketSecenekleri() { return anketSecenekleri; }
    public void setAnketSecenekleri(List<String> anketSecenekleri) { this.anketSecenekleri = anketSecenekleri; }
    
    public Map<String, Integer> getOylar() { return oylar; }
    public void setOylar(Map<String, Integer> oylar) { this.oylar = oylar; }
}