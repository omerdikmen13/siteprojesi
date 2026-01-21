import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { aidatApi } from '../api/apiClient';

export default function Aidatlar() {
  const router = useRouter();
  const [aidatlar, setAidatlar] = useState([]);
  const [rol, setRol] = useState('');
  const [yenileniyor, setYenileniyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Ekrana her dönüldüğünde verileri tazele
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userRol = await AsyncStorage.getItem('rol');
      setRol(userRol || '');

      const response = await aidatApi.tumAidatlar();
      setAidatlar(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setYukleniyor(false);
    }
  };

  const onRefresh = async () => {
    setYenileniyor(true);
    await loadData();
    setYenileniyor(false);
  };

  const handleOde = (item: any) => {
    // Ödeme ekranına yönlendir
    router.push({
      pathname: '/odeme-ekrani' as any,
      params: {
        id: item.id,
        tutar: item.tutar,
        donem: item.donem
      }
    });
  };

  const renderAidat = ({ item }: any) => {
    const isAdmin = rol === 'ADMIN';
    const odendi = item.personalPaid; // Sakin için kişisel ödeme durumu

    return (
      <TouchableOpacity
        style={styles.aidatCard}
        onPress={() => router.push(`/aidat-detay?id=${item.id}`)}
      >
        <View style={styles.aidatHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.aidatDonem}>{item.donem}</Text>
            <Text style={styles.aidatTutar}>{item.tutar} ₺ <Text style={{ fontSize: 12, color: '#666', fontWeight: 'normal' }}>(Daire Başı)</Text></Text>
          </View>

          {/* Sakin için kişisel durum rozeti */}
          {!isAdmin && (
            <View style={[styles.durumBadge, odendi ? styles.odendiBadge : styles.odenmemiBadge]}>
              <Ionicons
                name={odendi ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color="#fff"
              />
              <Text style={styles.durumText}>
                {odendi ? 'Ödendi' : 'Borç Bekliyor'}
              </Text>
            </View>
          )}

          {/* Admin için genel durum özeti */}
          {isAdmin && (
            <View style={[styles.durumBadge, item.odeyenSayisi === item.daireSayisi ? styles.odendiBadge : { backgroundColor: '#FFCC00' }]}>
              <Text style={styles.durumText}>
                {item.odeyenSayisi} / {item.daireSayisi} Ödedi
              </Text>
            </View>
          )}
        </View>

        {/* Sakin için numeric özet (Küçük yazı) */}
        {!isAdmin && (
          <Text style={styles.numericSummary}>
            Toplam {item.odeyenSayisi} / {item.daireSayisi} daire ödeme yaptı.
          </Text>
        )}

        {/* Admin için toplam toplanan tutar */}
        {isAdmin && (
          <View style={styles.adminStatsRow}>
            <Ionicons name="stats-chart" size={16} color="#007AFF" />
            <Text style={styles.adminStatsText}>
              Toplam Tahsilat: <Text style={{ fontWeight: 'bold' }}>{item.toplamToplanan} ₺</Text>
            </Text>
          </View>
        )}

        {/* Ödeme Butonu Sadece Sakinler İçin */}
        {!isAdmin && !odendi && (
          <TouchableOpacity
            style={styles.odeButton}
            onPress={() => handleOde(item)}
          >
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.odeButtonText}>Hemen Öde</Text>
          </TouchableOpacity>
        )}

        {/* Başarı Mesajı (Sakin ödediyse) */}
        {!isAdmin && odendi && (
          <View style={styles.odemeBilgi}>
            <Ionicons name="checkmark-done-circle" size={16} color="#34C759" />
            <Text style={styles.odemeTarihText}>Ödemeniz tamamlanmıştır.</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Aidatlar</Text>
          <Text style={styles.headerSubtitle}>Ödeme ve borç durumunuz</Text>
        </View>
      </LinearGradient>

      {/* ADMIN için FAB butonu */}
      {rol === 'ADMIN' && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push('/aidat-form')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <FlatList
        data={aidatlar}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderAidat}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={yenileniyor} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz aidat kaydı yok</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  aidatCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.05)',
  },
  aidatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aidatDonem: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  aidatTutar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  durumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  odendiBadge: {  // ⭐ Yazım hatası düzeltildi
    backgroundColor: '#34C759',
  },
  odenmemiBadge: {
    backgroundColor: '#FF3B30',
  },
  durumText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  odeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  odeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  odemeBilgi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  odemeTarihText: {
    fontSize: 14,
    color: '#34C759',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  numericSummary: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  adminStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(0,122,255,0.05)',
    padding: 10,
    borderRadius: 10,
  },
  adminStatsText: {
    fontSize: 14,
    color: '#007AFF',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
});