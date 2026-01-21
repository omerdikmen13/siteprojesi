import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { harcamaApi } from './api/apiClient';

export default function HarcamaDetay() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [harcama, setHarcama] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await harcamaApi.harcamaDetay(Number(id));
      setHarcama(response.data.data);
    } catch (error) {
      Alert.alert('Hata', 'Harcama bilgisi yüklenemedi');
      router.back();
    } finally {
      setYukleniyor(false);
    }
  };

  const getKategoriIcon = (kategori: string) => {
    const icons: any = {
      'Genel': 'folder',
      'Bakım': 'construct',
      'Temizlik': 'sparkles',
      'Güvenlik': 'shield',
      'Diğer': 'apps',
    };
    return icons[kategori] || 'cash';
  };

  const getKategoriColor = (kategori: string) => {
    const colors: any = {
      'Genel': '#007AFF',
      'Bakım': '#FF9500',
      'Temizlik': '#5AC8FA',
      'Güvenlik': '#FF3B30',
      'Diğer': '#8E8E93',
    };
    return colors[kategori] || '#007AFF';
  };

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!harcama) {
    return (
      <View style={styles.centerContainer}>
        <Text>Harcama bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Başlık Kartı */}
      <View style={styles.headerCard}>
        <View style={[styles.iconCircle, { backgroundColor: getKategoriColor(harcama.kategori) + '20' }]}>
          <Ionicons 
            name={getKategoriIcon(harcama.kategori)} 
            size={48} 
            color={getKategoriColor(harcama.kategori)} 
          />
        </View>
        <Text style={styles.baslik}>{harcama.baslik}</Text>
        <View style={[styles.kategoriBadge, { backgroundColor: getKategoriColor(harcama.kategori) }]}>
          <Text style={styles.kategoriText}>{harcama.kategori}</Text>
        </View>
      </View>

      {/* Tutar Kartı */}
      <View style={styles.tutarCard}>
        <Text style={styles.tutarLabel}>Harcama Tutarı</Text>
        <Text style={styles.tutarValue}>{harcama.tutar} ₺</Text>
      </View>

      {/* Detay Bilgileri */}
      <View style={styles.detayCard}>
        <View style={styles.detayRow}>
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <View style={styles.detayContent}>
            <Text style={styles.detayLabel}>Tarih</Text>
            <Text style={styles.detayValue}>
              {new Date(harcama.tarih).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {harcama.aciklama && (
          <>
            <View style={styles.divider} />
            <View style={styles.detayRow}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
              <View style={styles.detayContent}>
                <Text style={styles.detayLabel}>Açıklama</Text>
                <Text style={styles.aciklamaText}>{harcama.aciklama}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Bilgi Notu */}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={24} color="#007AFF" />
        <Text style={styles.infoNoteText}>
          Bu harcama site yönetimi tarafından kaydedilmiştir ve aidatlardan karşılanmaktadır.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 30,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  baslik: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  kategoriBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  kategoriText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tutarCard: {
    backgroundColor: '#fff',
    padding: 25,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tutarLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  tutarValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  detayCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detayRow: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  detayContent: {
    marginLeft: 15,
    flex: 1,
  },
  detayLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detayValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  aciklamaText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#f0f8ff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 30,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
});