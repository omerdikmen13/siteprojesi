package com.siteduyuru.veritabani;

import com.siteduyuru.model.Mesaj;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MesajVeriDeposu extends JpaRepository<Mesaj, Long> {

        // Kullanıcının aldığı mesajlar (Bireysel + Genele açık)
        @Query("SELECT m FROM Mesaj m WHERE (m.aliciId = :userId AND m.aliciSildi = false) OR (m.tip = 'ADMIN_TO_ALL' AND m.aliciSildi = false) ORDER BY m.tarih DESC")
        List<Mesaj> findByAliciIdOrPublic(Long userId);

        // Kullanıcının gönderdiği mesajlar
        List<Mesaj> findByGonderenIdOrderByTarihDesc(Long gonderenId);

        // Admin için: Gelen tüm kutusu
        List<Mesaj> findByTipOrderByTarihDesc(Mesaj.MesajTipi tip);

        // Okunmamış mesaj sayısı
        long countByAliciIdAndOkunduFalse(Long aliciId);

        // Admin için okunmamış Sakin mesajları
        long countByTipAndOkunduFalse(Mesaj.MesajTipi tip);

        // Konuşma geçmişi (Thread) - Hem ana mesajı hem de yanıtları getirir
        @Query("SELECT m FROM Mesaj m WHERE (m.id = :anaMesajId OR m.anaMesajId = :anaMesajId) " +
                        "AND ((m.gonderenId = :userId AND m.gonderenSildi = false) OR (m.aliciId = :userId AND m.aliciSildi = false) OR (m.aliciId IS NULL AND m.gonderenId != :userId AND m.aliciSildi = false)) "
                        +
                        "ORDER BY m.tarih ASC")
        List<Mesaj> findThread(Long anaMesajId, Long userId);

        // Ana mesajları (konuşma başlarını) getirmek için
        @Query("SELECT m FROM Mesaj m WHERE (m.anaMesajId IS NULL OR m.anaMesajId = m.id) " +
                        "AND ((m.aliciId = :userId AND m.aliciSildi = false) OR (m.gonderenId = :userId AND m.gonderenSildi = false) OR (m.tip = 'ADMIN_TO_ALL' AND m.aliciSildi = false)) "
                        +
                        "ORDER BY m.tarih DESC")
        List<Mesaj> findRootMessagesForUser(Long userId);

        @Query("SELECT m FROM Mesaj m WHERE (m.anaMesajId IS NULL OR m.anaMesajId = m.id) " +
                        "AND ((m.gonderenId = :adminId AND m.gonderenSildi = false) OR (m.aliciId = :adminId AND m.aliciSildi = false) OR (m.tip = 'USER_TO_ADMIN' AND m.aliciSildi = false)) "
                        +
                        "ORDER BY m.tarih DESC")
        List<Mesaj> findRootMessagesForAdmin(Long adminId);

        // MySQL uyumlu - Pageable ile LIMIT yerine
        @Query("SELECT m FROM Mesaj m WHERE (m.anaMesajId = :anaMesajId OR m.id = :anaMesajId) " +
                        "AND ((m.gonderenId = :userId AND m.gonderenSildi = false) OR (m.aliciId = :userId AND m.aliciSildi = false) OR (m.aliciId IS NULL AND m.gonderenId != :userId AND m.aliciSildi = false)) "
                        +
                        "ORDER BY m.tarih DESC")
        List<Mesaj> findLatestInThread(Long anaMesajId, Long userId, Pageable pageable);
}
