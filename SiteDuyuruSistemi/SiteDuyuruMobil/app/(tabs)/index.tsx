import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { aidatApi, duyuruApi, harcamaApi } from '../api/apiClient';

export default function AnaSayfa() {
  const router = useRouter();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [rol, setRol] = useState('');
  const [duyuruSayisi, setDuyuruSayisi] = useState(0);
  const [odenmemisAidat, setOdenmemisAidat] = useState(0);
  const [toplamHarcama, setToplamHarcama] = useState(0);
  const [yenileniyor, setYenileniyor] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ad, userRol] = await Promise.all([
        AsyncStorage.getItem('kullaniciAdi'),
        AsyncStorage.getItem('rol'),
      ]);

      setKullaniciAdi(ad || 'Kullanıcı');
      setRol(userRol || '');

      const [duyurular, aidatlar, harcamalar] = await Promise.all([
        duyuruApi.tumDuyurular(),
        aidatApi.tumAidatlar(),
        harcamaApi.tumHarcamalar(),
      ]);

      setDuyuruSayisi(duyurular.data?.count || 0);

      const aidatListesi = aidatlar.data?.data || [];
      const odenmemis = aidatListesi.filter((a: any) => a.durum === 'ODENMEDI').length;
      setOdenmemisAidat(odenmemis);

      const harcamaListesi = harcamalar.data?.data || [];
      const toplam = harcamaListesi.reduce(
        (sum: number, h: any) => sum + (h.tutar || 0),
        0
      );
      setToplamHarcama(toplam);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const onRefresh = async () => {
    setYenileniyor(true);
    await loadData();
    setYenileniyor(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={
        <RefreshControl refreshing={yenileniyor} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Merhaba,</Text>
            <Text style={styles.userName}>{kullaniciAdi}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profil')}
          >
            <Ionicons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{duyuruSayisi}</Text>
            <Text style={styles.summaryLabel}>Duyuru</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{odenmemisAidat}</Text>
            <Text style={styles.summaryLabel}>Aidat</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{toplamHarcama.toFixed(0)}₺</Text>
            <Text style={styles.summaryLabel}>Gider</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Ana Grid Menü */}
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push('/(tabs)/duyurular')}
        >
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.iconCircle}>
            <Ionicons name="notifications" size={26} color="#fff" />
          </LinearGradient>
          <Text style={styles.gridLabel}>Duyurular</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push('/(tabs)/aidatlar')}
        >
          <LinearGradient colors={['#10B981', '#059669']} style={styles.iconCircle}>
            <Ionicons name="wallet" size={26} color="#fff" />
          </LinearGradient>
          <Text style={styles.gridLabel}>Aidat Öde</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push('/(tabs)/harcamalar')}
        >
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.iconCircle}>
            <Ionicons name="stats-chart" size={26} color="#fff" />
          </LinearGradient>
          <Text style={styles.gridLabel}>Analizler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => router.push('/gemini-chat')}
        >
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.iconCircle}>
            <Ionicons name="sparkles" size={26} color="#fff" />
          </LinearGradient>
          <Text style={styles.gridLabel}>AI Asistan</Text>
        </TouchableOpacity>
      </View>

      {/* Hızlı Eylemler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/sikayet-form')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#0066CC" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Şikayet & Öneri</Text>
            <Text style={styles.actionSubtitle}>Bize iletmek istediklerinizi yazın</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        {rol === 'ADMIN' && (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/kullanici-list')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={24} color="#0066CC" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Sakin Listesi</Text>
              <Text style={styles.actionSubtitle}>Site sakinlerini yönetin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      {/* Önemli Bilgi */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#0066CC" />
        <Text style={styles.infoBoxText}>
          Yeni aidat dönemleri her ayın 15'inde otomatik olarak oluşturulmaktadır.
        </Text>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    backdropFilter: 'blur(10px)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    marginTop: 10,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(0,102,204,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,102,204,0.05)',
    margin: 20,
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.1)',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#004499',
    lineHeight: 18,
    fontWeight: '600',
  },
});
