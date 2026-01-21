package com.siteduyuru.servis;

import com.siteduyuru.model.Mesaj;
import com.siteduyuru.veritabani.MesajVeriDeposu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MesajServisi {

    @Autowired
    private MesajVeriDeposu mesajVeriDeposu;

    public Mesaj mesajGonder(Mesaj mesaj) {
        if (mesaj != null) {
            Mesaj saved = mesajVeriDeposu.save(mesaj);
            // Eğer root mesaj ise ve anaMesajId set edilmemişse, kendini set et (gruplama
            // kolaylığı için)
            if (saved.getAnaMesajId() == null) {
                saved.setAnaMesajId(saved.getId());
                mesajVeriDeposu.save(saved);
            }
            return saved;
        }
        return null;
    }

    public List<Mesaj> kullaniciGelenKonusmalari(Long userId) {
        return mesajVeriDeposu.findRootMessagesForUser(userId);
    }

    public List<Mesaj> adminGelenKonusmalari(Long adminId) {
        return mesajVeriDeposu.findRootMessagesForAdmin(adminId);
    }

    public List<Mesaj> konusmaGecmisi(Long anaMesajId, Long userId) {
        return mesajVeriDeposu.findThread(anaMesajId, userId);
    }

    public Optional<Mesaj> idIleBul(Long id) {
        if (id == null)
            return Optional.empty();
        return mesajVeriDeposu.findById(id);
    }

    public void okunduIsaretle(Long mesajId) {
        if (mesajId != null) {
            mesajVeriDeposu.findById(mesajId).ifPresent(m -> {
                m.setOkundu(true);
                mesajVeriDeposu.save(m);
            });
        }
    }

    public long okunmamisSayisi(Long userId) {
        return mesajVeriDeposu.countByAliciIdAndOkunduFalse(userId);
    }

    public long adminOkunmamisSayisi() {
        return mesajVeriDeposu.countByTipAndOkunduFalse(Mesaj.MesajTipi.USER_TO_ADMIN);
    }

    public Mesaj sonMesajiBul(Long anaMesajId, Long userId) {
        List<Mesaj> results = mesajVeriDeposu.findLatestInThread(anaMesajId, userId, PageRequest.of(0, 1));
        return results.isEmpty() ? null : results.get(0);
    }

    public void mesajSil(Long id, Long kullaniciId) {
        mesajVeriDeposu.findById(id).ifPresent(m -> {
            if (m.getGonderenId().equals(kullaniciId)) {
                if (!m.isSilindi()) {
                    m.setSilindi(true); // Kendi gönderdiğini silerse içerik herkes için silinir
                }
                m.setGonderenSildi(true);
            } else {
                // Alıcı (veya Admin havuzu/Genel duyuru alıcısı)
                m.setAliciSildi(true);
            }
            mesajVeriDeposu.save(m);
        });
    }

    public void konusmaSil(Long anaMesajId, Long kullaniciId) {
        List<Mesaj> thread = mesajVeriDeposu.findThread(anaMesajId, kullaniciId);
        thread.forEach(m -> {
            if (m.getGonderenId().equals(kullaniciId)) {
                m.setGonderenSildi(true);
            } else {
                m.setAliciSildi(true);
            }
            mesajVeriDeposu.save(m);
        });
    }

    // Geriye dönük uyumluluk için (Mobil/Web eski kısımlar)
    public List<Mesaj> kullaniciGelenKutusu(Long userId) {
        return mesajVeriDeposu.findByAliciIdOrPublic(userId);
    }

    public List<Mesaj> kullaniciGonderilenler(Long userId) {
        return mesajVeriDeposu.findByGonderenIdOrderByTarihDesc(userId);
    }

    public List<Mesaj> adminGelenKutusu() {
        return mesajVeriDeposu.findByTipOrderByTarihDesc(Mesaj.MesajTipi.USER_TO_ADMIN);
    }
}
