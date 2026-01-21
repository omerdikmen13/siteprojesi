package com.siteduyuru.servis;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiServisi {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String metinUret(String prompt) {
        // API anahtarını URL'ye ekle
        String url = apiUrl + "?key=" + apiKey;

        // JSON Gövdesi
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))));

        // Header Ayarları
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String response = restTemplate.postForObject(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response);

            // Yanıtı ayıklama
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            System.err.println("Gemini API Hatası: " + e.getMessage());
            e.printStackTrace();
            return "AI yanıt üretemedi: " + e.getMessage();
        }
    }

    public String ihbarnameMetniOlustur(String donem, Double tutar) {
        String prompt = "Site yöneticisi adına site sakinlerine bir mesaj yaz. " +
                donem + " dönemine ait " + tutar + " TL tutarındaki aidat ödemesini henüz yapmadıkları için " +
                "resmi, ciddi ama kibar bir hatırlatma (ihbarname) mesajı olsun. " +
                "Kısa ve net olsun. Ödeme yapmaları gerektiğini belirt.";
        return metinUret(prompt);
    }
}
