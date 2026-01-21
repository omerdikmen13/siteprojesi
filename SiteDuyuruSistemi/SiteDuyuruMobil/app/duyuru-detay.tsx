import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient, { duyuruApi } from './api/apiClient';

export default function DuyuruDetay() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [duyuru, setDuyuru] = useState<any>(null);
  const [rol, setRol] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [secilenSecenek, setSecilenSecenek] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRol, userName] = await Promise.all([
        AsyncStorage.getItem('rol'),
        AsyncStorage.getItem('kullaniciAdi'),
      ]);
      setRol(userRol || '');
      setKullaniciAdi(userName || '');

      const response = await duyuruApi.duyuruDetay(Number(id));
      const duyuruData = response.data.data;
      setDuyuru(duyuruData);

      if (duyuruData.anketMi && duyuruData.oylar && userName) {
        const kullaniciOyu = duyuruData.oylar[userName];
        if (kullaniciOyu !== undefined) {
          setSecilenSecenek(kullaniciOyu);
        }
      }
    } catch (error) {
      Alert.alert('Hata', 'Duyuru yüklenemedi');
      router.back();
    } finally {
      setYukleniyor(false);
    }
  };

  const handleOyVer = async () => {
    if (secilenSecenek === null) {
      Alert.alert('Uyarı', 'Lütfen bir seçenek seçin');
      return;
    }

    try {
      await apiClient.post('/api/duyurular/oy-ver', {
        duyuruId: Number(id),
        secenekIndex: secilenSecenek,
      });

      Alert.alert('Başarılı', 'Oyunuz kaydedildi');
      loadData();
    } catch (error) {
      Alert.alert('Hata', 'Oy gönderilemedi');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Duyuru Sil',
      'Bu duyuruyu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await duyuruApi.duyuruSil(Number(id));
              Alert.alert('Başarılı', 'Duyuru silindi');
              router.back();
            } catch (error) {
              Alert.alert('Hata', 'Duyuru silinemedi');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!duyuru) {
    return (
      <View style={styles.centerContainer}>
        <Text>Duyuru bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {duyuru.onemli && (
          <View style={styles.onemBadge}>
            <Ionicons name="alert-circle" size={16} color="#fff" />
            <Text style={styles.onemText}>ÖNEMLİ</Text>
          </View>
        )}

        <Text style={styles.baslik}>{duyuru.baslik}</Text>

        <View style={styles.tarihContainer}>
          <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.tarihText}>{formatDate(duyuru.olusturmaTarihi)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.contentWrapper}>
        {/* İçerik Kartı */}
        <View style={styles.icerikCard}>
          <Text style={styles.icerik}>{duyuru.icerik}</Text>
        </View>

        {/* Anket Bölümü */}
        {duyuru.anketMi && duyuru.anketSecenekleri && duyuru.anketSecenekleri.length > 0 && (
          <View style={styles.anketCard}>
            <View style={styles.anketHeader}>
              <View style={styles.anketIcon}>
                <Ionicons name="stats-chart" size={20} color="#0066CC" />
              </View>
              <View>
                <Text style={styles.anketBaslik}>Anket</Text>
                <Text style={styles.anketSubtitle}>Görüşünüzü belirtin</Text>
              </View>
            </View>

            <View style={styles.anketSecenekler}>
              {duyuru.anketSecenekleri.map((secenek: string, index: number) => {
                const oyAdedi = Object.values(duyuru.oylar || {}).filter((oy: any) => oy === index).length;
                const toplamOy = Object.keys(duyuru.oylar || {}).length;
                const yuzde = toplamOy > 0 ? ((oyAdedi / toplamOy) * 100).toFixed(0) : 0;
                const seciliMi = secilenSecenek === index;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.secenekButton, seciliMi && styles.secenekButtonActive]}
                    onPress={() => setSecilenSecenek(index)}
                  >
                    <View style={styles.secenekTop}>
                      <View style={styles.radioContainer}>
                        <View style={[styles.radioOuter, seciliMi && styles.radioOuterActive]}>
                          {seciliMi && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.secenekMetin, seciliMi && styles.secenekMetinActive]}>
                          {secenek}
                        </Text>
                      </View>
                      <Text style={styles.yuzdeMetin}>%{yuzde}</Text>
                    </View>

                    <View style={styles.oyBar}>
                      <View style={[styles.oyProgress, { width: `${yuzde}%` as any }]} />
                    </View>

                    <Text style={styles.oyBilgi}>{oyAdedi} kişi oy verdi</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {secilenSecenek !== null && (
              <TouchableOpacity style={styles.oyVerButton} onPress={handleOyVer}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.oyVerButtonText}>Oyu Gönder</Text>
              </TouchableOpacity>
            )}

            <View style={styles.anketFooter}>
              <Text style={styles.toplamOyText}>Toplam Katılım: {Object.keys(duyuru.oylar || {}).length}</Text>
            </View>
          </View>
        )}

        {/* Admin İşlemleri */}
        {rol === 'ADMIN' && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Duyuruyu Kalıcı Olarak Sil</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  backButton: {
    marginBottom: 20,
  },
  onemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 15,
  },
  onemText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  baslik: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tarihContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tarihText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  contentWrapper: {
    padding: 20,
    marginTop: -20,
  },
  icerikCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.05)',
  },
  icerik: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 26,
    fontWeight: '400',
  },
  anketCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.05)',
  },
  anketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 25,
  },
  anketIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(0,102,204,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anketBaslik: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  anketSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  anketSecenekler: {
    gap: 12,
  },
  secenekButton: {
    padding: 16,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  secenekButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: 'rgba(0,102,204,0.02)',
  },
  secenekTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#0066CC',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  secenekMetin: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  secenekMetinActive: {
    color: '#0066CC',
    fontWeight: '800',
  },
  yuzdeMetin: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  oyBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  oyProgress: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 3,
  },
  oyBilgi: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  oyVerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 15,
    gap: 10,
    marginTop: 25,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  oyVerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  anketFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toplamOyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});