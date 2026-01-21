package com.siteduyuru;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableAsync;
import com.siteduyuru.model.*;
import com.siteduyuru.veritabani.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication
@ComponentScan(basePackages = "com.siteduyuru")
@EnableAsync // Mail gönderimi asenkron çalışsın diye
public class SiteDuyuruSistemiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SiteDuyuruSistemiApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedData(
            KullaniciVeriDeposu kullaniciRepo,
            DuyuruVeriDeposu duyuruRepo,
            AidatVeriDeposu aidatRepo,
            HarcamaVeriDeposu harcamaRepo,
            PasswordEncoder passwordEncoder,
            org.springframework.jdbc.core.JdbcTemplate jdbc) {
        return args -> {
            try {
                // Tablo eksikliklerini gider (MySQL icin opsiyonel manuel kontrol)
                try {
                    jdbc.execute("ALTER TABLE mesajlar ADD COLUMN IF NOT EXISTS silindi BOOLEAN DEFAULT FALSE");
                    jdbc.execute("ALTER TABLE mesajlar ADD COLUMN IF NOT EXISTS gonderen_sildi BOOLEAN DEFAULT FALSE");
                    jdbc.execute("ALTER TABLE mesajlar ADD COLUMN IF NOT EXISTS alici_sildi BOOLEAN DEFAULT FALSE");
                    jdbc.execute("UPDATE mesajlar SET ana_mesaj_id = id WHERE ana_mesaj_id IS NULL");
                } catch (Exception e) {
                    // Sessizce geç, tablo yoksa veya zaten varsa sorun yok
                }

                // Eğer admin yoksa oluştur
                if (kullaniciRepo.findByEmail("admin@test.com").isEmpty()) {
                    System.out.println("=== BASLANGIC VERILERI EKLENIYOR ===");

                    // Admin kullanıcı
                    Kullanici admin = new Kullanici();
                    admin.setAdSoyad("Admin Kullanıcı");
                    admin.setEmail("admin@test.com");
                    admin.setSifre(passwordEncoder.encode("123456"));
                    admin.setRolu(Kullanici.KullaniciRolu.ADMIN);
                    admin.setDaireNo("YONETİM");
                    kullaniciRepo.save(admin);
                    System.out.println("✓ Admin kullanici olustu: admin@test.com / 123456");

                    // Normal kullanıcı
                    Kullanici sakin = new Kullanici();
                    sakin.setAdSoyad("Ahmet Yılmaz");
                    sakin.setEmail("ahmet@test.com");
                    sakin.setSifre(passwordEncoder.encode("123456"));
                    sakin.setRolu(Kullanici.KullaniciRolu.KULLANICI);
                    sakin.setDaireNo("A-101");
                    kullaniciRepo.save(sakin);
                    System.out.println("✓ Site sakini olustu: ahmet@test.com / 123456");

                    // Duyurular
                    Duyuru duyuru1 = new Duyuru();
                    duyuru1.setBaslik("Siteye Hoş Geldiniz!");
                    duyuru1.setIcerik(
                            "Site Duyuru Sistemine hoş geldiniz. Bu platform üzerinden tüm site duyurularını takip edebilir, aidat ödemelerinizi yapabilir ve yönetimle iletişime geçebilirsiniz.");
                    duyuru1.setOnemli(true);
                    duyuru1.setOlusturmaTarihi(LocalDateTime.now());
                    duyuruRepo.save(duyuru1);

                    Duyuru duyuru2 = new Duyuru();
                    duyuru2.setBaslik("Ocak Ayı Aidat Bildirimi");
                    duyuru2.setIcerik(
                            "Ocak 2025 dönemi aidat tahakkuku yapılmıştır. Lütfen ödemenizi son ödeme tarihine kadar gerçekleştiriniz.");
                    duyuru2.setOnemli(false);
                    duyuru2.setOlusturmaTarihi(LocalDateTime.now().minusDays(2));
                    duyuruRepo.save(duyuru2);

                    Duyuru duyuru3 = new Duyuru();
                    duyuru3.setBaslik("Asansör Bakımı Hakkında");
                    duyuru3.setIcerik(
                            "15 Ocak 2025 tarihinde saat 10:00-14:00 arasında asansör bakımı yapılacaktır. Bu süre zarfında asansörler kullanıma kapalı olacaktır.");
                    duyuru3.setOnemli(false);
                    duyuru3.setOlusturmaTarihi(LocalDateTime.now().minusDays(5));
                    duyuruRepo.save(duyuru3);
                    System.out.println("✓ 3 duyuru eklendi");

                    // Aidatlar
                    Aidat aidat1 = new Aidat();
                    aidat1.setAy("Ocak");
                    aidat1.setYil(2025);
                    aidat1.setDonem("Ocak 2025");
                    aidat1.setTutar(750.0);
                    aidat1.setDaireSayisi(20);
                    aidat1.setDurum(Aidat.AidatDurumu.ODENMEDI);
                    aidatRepo.save(aidat1);

                    Aidat aidat2 = new Aidat();
                    aidat2.setAy("Aralık");
                    aidat2.setYil(2024);
                    aidat2.setDonem("Aralık 2024");
                    aidat2.setTutar(700.0);
                    aidat2.setDaireSayisi(20);
                    aidat2.setDurum(Aidat.AidatDurumu.ODENDI);
                    aidat2.setOdemeTarihi(LocalDate.of(2024, 12, 15));
                    aidatRepo.save(aidat2);

                    Aidat aidat3 = new Aidat();
                    aidat3.setAy("Kasım");
                    aidat3.setYil(2024);
                    aidat3.setDonem("Kasım 2024");
                    aidat3.setTutar(700.0);
                    aidat3.setDaireSayisi(20);
                    aidat3.setDurum(Aidat.AidatDurumu.ODENDI);
                    aidat3.setOdemeTarihi(LocalDate.of(2024, 11, 20));
                    aidatRepo.save(aidat3);
                    System.out.println("✓ 3 aidat eklendi");

                    // Harcamalar
                    Harcama harcama1 = new Harcama();
                    harcama1.setBaslik("Elektrik Faturası");
                    harcama1.setAciklama("Aralık 2024 ortak alan elektrik faturası");
                    harcama1.setTutar(2500.0);
                    harcama1.setKategori("Fatura");
                    harcama1.setTarih(LocalDate.now().minusDays(10));
                    harcamaRepo.save(harcama1);

                    Harcama harcama2 = new Harcama();
                    harcama2.setBaslik("Temizlik Malzemeleri");
                    harcama2.setAciklama("Ocak ayı temizlik malzemesi alımı");
                    harcama2.setTutar(850.0);
                    harcama2.setKategori("Temizlik");
                    harcama2.setTarih(LocalDate.now().minusDays(3));
                    harcamaRepo.save(harcama2);
                    System.out.println("✓ 2 harcama eklendi");

                    System.out.println("=== BASLANGIC VERILERI TAMAMLANDI ===");
                    System.out.println("");
                    System.out.println(">>> GIRIS BILGILERI <<<");
                    System.out.println("Admin: admin@test.com / 123456");
                    System.out.println("Sakin: ahmet@test.com / 123456");
                    System.out.println("");
                }
            } catch (Exception e) {
                System.out.println("Baslangic verileri eklenirken hata: " + e.getMessage());
            }
        };
    }
}
