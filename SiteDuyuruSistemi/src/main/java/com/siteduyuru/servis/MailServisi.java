package com.siteduyuru.servis;

import com.siteduyuru.model.Duyuru;
import com.siteduyuru.model.Kullanici;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Mail Servisi - FastAPI Mail Mikroservisi ile iletişim kurar
 * 
 * Bu servis, 16.16.121.12:8000 adresinde çalışan Python FastAPI
 * mail servisine HTTP istekleri göndererek email gönderimini sağlar.
 * 
 * Mikroservis Mimarisi:
 * - Java Backend (16.16.255.16:8080) → HTTP → FastAPI (16.16.121.12:8000) →
 * Gmail SMTP
 */
@Service
public class MailServisi {

    // Mail servisi URL'i (production'da AWS IP, lokal'de localhost)
    @Value("${mail.service.url:http://16.16.121.12:8000}")
    private String mailServiceUrl;

    private final RestTemplate restTemplate;
    private final KullaniciServisi kullaniciServisi;

    public MailServisi(KullaniciServisi kullaniciServisi) {
        this.restTemplate = new RestTemplate();
        this.kullaniciServisi = kullaniciServisi;
    }

    /**
     * Tek bir kullanıcıya email gönderir
     * 
     * @param toEmail Alıcı email adresi
     * @param subject Email konusu
     * @param body    Email içeriği
     * @param isHtml  HTML formatında mı?
     * @return Gönderim başarılı mı?
     */
    public boolean emailGonder(String toEmail, String subject, String body, boolean isHtml) {
        try {
            String url = mailServiceUrl + "/send-email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to_email", toEmail);
            requestBody.put("subject", subject);
            requestBody.put("body", body);
            requestBody.put("is_html", isHtml);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("✅ Email başarıyla gönderildi: " + toEmail);
                return true;
            }
        } catch (Exception e) {
            System.err.println("❌ Email gönderme hatası (" + toEmail + "): " + e.getMessage());
        }
        return false;
    }

    /**
     * Duyuru bildirim maili gönderir (özel endpoint kullanır)
     */
    public boolean duyuruBildirimiGonder(String toEmail, String duyuruBaslik, String duyuruIcerik) {
        try {
            String url = mailServiceUrl + "/send-duyuru";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // HTML formatında güzel bir email oluştur
            String htmlBody = String.format(
                    """
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; text-align: center;">
                                    <h1 style="margin:0;">🏠 Site Duyuru Sistemi</h1>
                                </div>
                                <div style="padding: 20px; background: #f9f9f9;">
                                    <h2 style="color: #333;">📢 %s</h2>
                                    <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                        <p style="color: #555; line-height: 1.6;">%s</p>
                                    </div>
                                    <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">
                                        Bu mail Site Duyuru Sistemi tarafından otomatik olarak gönderilmiştir.
                                    </p>
                                </div>
                            </div>
                            """,
                    duyuruBaslik, duyuruIcerik);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("to_email", toEmail);
            requestBody.put("subject", duyuruBaslik);
            requestBody.put("body", htmlBody);
            requestBody.put("is_html", true);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            System.err.println("❌ Duyuru maili gönderilemedi: " + e.getMessage());
            return false;
        }
    }

    /**
     * Yeni duyuru oluşturulduğunda TÜM aktif kullanıcılara email gönderir
     * 
     * @Async annotation ile asenkron çalışır - ana işlemi bloklamaz
     * 
     * @param duyuru Yeni oluşturulan duyuru
     */
    @Async
    public void tumKullaniciaraDuyuruGonder(Duyuru duyuru) {
        System.out.println("📧 Duyuru email bildirimi başlatılıyor: " + duyuru.getBaslik());

        List<Kullanici> tumKullanicilar = kullaniciServisi.tumKullanicilariGetir();

        int basarili = 0;
        int basarisiz = 0;

        for (Kullanici kullanici : tumKullanicilar) {
            if (kullanici.getEmail() != null && !kullanici.getEmail().isEmpty()) {
                boolean sonuc = duyuruBildirimiGonder(
                        kullanici.getEmail(),
                        duyuru.getBaslik(),
                        duyuru.getIcerik());

                if (sonuc) {
                    basarili++;
                } else {
                    basarisiz++;
                }

                // Rate limiting - her email arasında kısa bekleme
                try {
                    Thread.sleep(500); // 500ms bekleme
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }

        System.out.println("📧 Duyuru email bildirimi tamamlandı: " +
                basarili + " başarılı, " + basarisiz + " başarısız");
    }
}
