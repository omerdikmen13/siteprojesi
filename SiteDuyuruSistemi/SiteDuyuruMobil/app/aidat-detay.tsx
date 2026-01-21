import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aidatApi } from './api/apiClient';

export default function AidatDetay() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [aidat, setAidat] = useState<any>(null);
  const [odeyenler, setOdeyenler] = useState<any[]>([]);
  const [borclular, setBorclular] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [rol, setRol] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedRol = await AsyncStorage.getItem('rol');
      setRol(storedRol || '');

      const response = await aidatApi.aidatDetay(Number(id));
      const resData = response.data.data;

      setAidat(resData);
      setStats(resData.stats);

      if (storedRol === 'ADMIN') {
        setOdeyenler(resData.odeyenler || []);
        setBorclular(resData.borclular || []);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Bilgiler yüklenemedi');
      router.back();
    } finally {
      setYukleniyor(false);
    }
  };

  const handleOde = () => {
    if (rol === 'ADMIN') {
      Alert.alert('Uyarı', 'Yöneticiler aidat ödemesi yapamaz.');
      return;
    }
    router.push({
      pathname: '/odeme-ekrani' as any,
      params: {
        id: id,
        tutar: aidat.tutar,
        donem: aidat.donem
      }
    });
  };

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!aidat) {
    return (
      <View style={styles.centerContainer}>
        <Text>Aidat bulunamadı</Text>
      </View>
    );
  }

  const isAdmin = rol === 'ADMIN';
  const odendi = isAdmin ? aidat.durum === 'ODENDI' : aidat.personalPaid;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Üst Bilgi Alanı */}
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.statusBadge}>
          <Ionicons
            name={odendi ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {isAdmin
              ? (stats?.odeyenSayisi === stats?.toplamDaire ? 'TAMAMLANDI' : 'TAHSİLAT DEVAM EDİYOR')
              : (odendi ? 'ÖDENDİ' : 'ÖDEME BEKLENİYOR')}
          </Text>
        </View>

        <Text style={styles.donemText}>{aidat.donem}</Text>
        <Text style={styles.tutarText}>{aidat.tutar} ₺</Text>
      </LinearGradient>

      <View style={styles.contentWrapper}>

        {/* YÖNETİCİ İÇİN ÖZET KARTLARI */}
        {isAdmin && stats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="cash" size={24} color="#0369A1" />
              <Text style={styles.statValue}>{stats.toplamToplanan} ₺</Text>
              <Text style={styles.statLabel}>Toplam Tahsilat</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="people" size={24} color="#15803D" />
              <Text style={styles.statValue}>{stats.odeyenSayisi} / {stats.toplamDaire}</Text>
              <Text style={styles.statLabel}>Ödeyen Daire</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={24} color="#B91C1C" />
              <Text style={styles.statValue}>{stats.odemeyenSayisi}</Text>
              <Text style={styles.statLabel}>Borçlu Daire</Text>
            </View>
          </View>
        )}

        {/* SAKİN İÇİN ÖZET KARTI */}
        {!isAdmin && stats && (
          <View style={styles.residentInfoCard}>
            <Ionicons name="information-circle" size={24} color="#0066CC" />
            <Text style={styles.residentInfoText}>
              Şu ana kadar <Text style={{ fontWeight: 'bold' }}>{stats.odeyenSayisi} / {stats.toplamDaire}</Text> daire ödeme yaptı.
            </Text>
          </View>
        )}

        {/* Detay Kartı */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Genel Bilgiler</Text>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Dönem</Text>
              <Text style={styles.infoValue}>{aidat.donem}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="cash-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Daire Başı Tutar</Text>
              <Text style={styles.infoValue}>{aidat.tutar} ₺</Text>
            </View>
          </View>
        </View>

        {/* YÖNETİCİ İÇİN LİSTELER */}
        {isAdmin && (
          <View>
            {/* ÖDEYENLER */}
            <View style={styles.adminSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.cardTitle, { color: '#10B981' }]}>Ödeme Yapanlar</Text>
                <View style={[styles.countBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.countText, { color: '#15803D' }]}>{odeyenler.length}</Text>
                </View>
              </View>

              {odeyenler.length > 0 ? (
                odeyenler.map((item, index) => (
                  <View key={index} style={styles.odeyenItem}>
                    <View style={styles.daireNoBox}>
                      <Text style={styles.daireNoText}>{item.kullaniciDaireNo || '-'}</Text>
                    </View>
                    <View style={styles.odeyenInfo}>
                      <Text style={styles.odeyenEmail}>{item.kullaniciEmail}</Text>
                      <Text style={styles.odeyenTarih}>
                        {new Date(item.odemeTarihi).toLocaleDateString('tr-TR')} {new Date(item.odemeTarihi).getHours()}:{new Date(item.odemeTarihi).getMinutes()}
                      </Text>
                    </View>
                    <Text style={styles.odeyenTutar}>{item.odenenTutar} ₺</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySmallText}>Henüz ödeme yok.</Text>
              )}
            </View>

            {/* BORÇLULAR */}
            <View style={styles.adminSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Borçlu Olanlar</Text>
                <View style={[styles.countBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.countText, { color: '#B91C1C' }]}>{borclular.length}</Text>
                </View>
              </View>

              {borclular.length > 0 ? (
                borclular.map((item, index) => (
                  <View key={index} style={styles.odeyenItem}>
                    <View style={[styles.daireNoBox, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.daireNoText, { color: '#B91C1C' }]}>{item.daireNo || '-'}</Text>
                    </View>
                    <View style={styles.odeyenInfo}>
                      <Text style={styles.odeyenEmail}>{item.adSoyad}</Text>
                      <Text style={styles.odeyenTarih}>{item.email}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptySmallText}>Herkes ödeme yapmış. 🎉</Text>
              )}
            </View>
          </View>
        )}

        {/* KULLANICI İÇİN ÖDEME BUTONU */}
        {!isAdmin && !odendi && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.payButton} onPress={handleOde}>
              <LinearGradient
                colors={['#0066CC', '#004499']}
                style={styles.payGradient}
              >
                <Ionicons name="card-outline" size={22} color="#fff" />
                <Text style={styles.payButtonText}>Hemen Öde</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {!isAdmin && odendi && (
          <View style={styles.congratsCard}>
            <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
            <Text style={styles.congratsTitle}>Borcunuz Yok</Text>
            <Text style={styles.congratsSubtitle}>Bu döneme ait aidat ödemeniz başarıyla kaydedilmiştir.</Text>
          </View>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
    marginBottom: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  donemText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  tutarText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginTop: 5,
  },
  contentWrapper: {
    padding: 20,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  residentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  residentInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 5,
  },
  adminSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  odeyenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daireNoBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  daireNoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  odeyenInfo: {
    flex: 1,
  },
  odeyenEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  odeyenTarih: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  odeyenTutar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0066CC',
  },
  emptySmallText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 15,
    fontStyle: 'italic',
  },
  actionSection: {
    marginTop: 10,
  },
  payButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  congratsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    marginTop: 15,
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
