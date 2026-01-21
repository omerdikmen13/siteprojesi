import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ⭐ AWS EC2 SUNUCU ADRESİ
const API_BASE_URL = 'http://13.48.132.101:8082';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor (JWT Token ekleme)
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (401 Hatası = Token geçersiz)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'kullaniciAdi', 'rol', 'kullaniciId']);
      // Login sayfasına yönlendir (Router ile)
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// AUTH API
export const authApi = {
  login: (email: string, sifre: string) =>
    apiClient.post('/api/auth/login', { email, sifre }),
};

// DUYURU API
export const duyuruApi = {
  tumDuyurular: () => apiClient.get('/api/duyurular'),
  duyuruDetay: (id: number) => apiClient.get(`/api/duyurular/${id}`),
  duyuruEkle: (duyuru: any) => apiClient.post('/api/duyurular', duyuru),
  duyuruSil: (id: number) => apiClient.delete(`/api/duyurular/${id}`),
  oyVer: (duyuruId: number, secenekIndex: number) =>
    apiClient.post('/api/duyurular/oy-ver', { duyuruId, secenekIndex }),
};

// AIDAT API
export const aidatApi = {
  tumAidatlar: () => apiClient.get('/api/aidatlar'),
  aidatDetay: (id: number) => apiClient.get(`/api/aidatlar/${id}`),
  aidatOde: (id: number) => apiClient.post(`/api/aidatlar/ode/${id}`),
  aidatEkle: (aidat: any) => apiClient.post('/api/aidatlar', aidat),
  odeyenler: (id: number) => apiClient.get(`/api/aidatlar/${id}/odeyenler`),
};

// HARCAMA API
export const harcamaApi = {
  tumHarcamalar: () => apiClient.get('/api/harcamalar'),
  harcamaDetay: (id: number) => apiClient.get(`/api/harcamalar/${id}`),
  harcamaEkle: (harcama: any) => apiClient.post('/api/harcamalar', harcama),
};

// KULLANICI API
export const kullaniciApi = {
  tumKullanicilar: () => apiClient.get('/api/kullanicilar'),
  kullaniciDetay: (id: number) => apiClient.get(`/api/kullanicilar/${id}`),
  kullaniciEkle: (kullanici: any) => apiClient.post('/api/kullanicilar', kullanici),
  kullaniciSil: (id: number) => apiClient.delete(`/api/kullanicilar/${id}`),
};

// PROFİL API
export const profilApi = {
  profil: () => apiClient.get('/api/profil'),
};

// ŞİKAYET API
export const sikayetApi = {
  gonder: (data: any) => apiClient.post('/api/sikayet/gonder', data),
  kullaniciSikayetleri: (kullaniciId: number) => apiClient.get(`/api/sikayet/listem/${kullaniciId}`),
};


export const geminiApi = {
  duyuruSoru: (soru: string) =>
    apiClient.post('/api/gemini/duyuru-soru', { soru }),
  aidatSoru: (soru: string) =>
    apiClient.post('/api/gemini/aidat-soru', { soru }),
  harcamaSoru: (soru: string) =>
    apiClient.post('/api/gemini/harcama-soru', { soru }),
  genelSoru: (soru: string) =>
    apiClient.post('/api/gemini/soru', { soru }),
};

// ÖDEME API (Stripe Entegrasyonu)
export const odemeApi = {
  // 1. Ödeme Niyeti Oluştur (Backend Stripe'a gider)
  createPaymentIntent: (data: {
    aidatId: number;
    tutar: number;
    kullaniciId: number | null;
  }) => apiClient.post('/api/odeme/intent', data),

  // 2. Ödemeyi Backend'e Onaylat (Opsiyonel, Kayıt için)
  confirmPayment: (data: {
    paymentId: string;
    aidatId: number;
    tutar: number;
    kullaniciId: number | null;
  }) => apiClient.post('/api/odeme/onayla', data),

  // Eski test metotları (kaldırılabilir veya ref için tutulabilir)
  testKartlari: () => apiClient.get('/api/odeme/test-kartlari'),
};

// MESAJ API
export const mesajApi = {
  konusmalar: () => apiClient.get('/api/mesajlar/konusmalar'),
  konusma: (anaMesajId: number) => apiClient.get(`/api/mesajlar/konusma/${anaMesajId}`),
  gonder: (data: {
    baslik: string;
    icerik: string;
    aliciId?: number | null;
    toplu?: boolean;
    anaMesajId?: number | null;
  }) => apiClient.post('/api/mesajlar/gonder', data),
  oku: (id: number) => apiClient.post(`/api/mesajlar/${id}/oku`),
  sayi: () => apiClient.get('/api/mesajlar/sayi'),
  mesajSil: (id: number) => apiClient.post(`/api/mesajlar/sil/${id}`),
  konusmaSil: (anaMesajId: number) => apiClient.post(`/api/mesajlar/konusma-sil/${anaMesajId}`),
  // Geriye dönük uyumluluk
  gelenler: () => apiClient.get('/api/mesajlar/gelenler'),
};