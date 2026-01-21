import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { profilApi, mesajApi } from '../api/apiClient';

export default function Profil() {
  const router = useRouter();
  const [profil, setProfil] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadProfil();
  }, []);

  const loadProfil = async () => {
    try {
      const response = await profilApi.profil();
      setProfil(response.data.data);

      const unreadRes = await mesajApi.sayi();
      setUnreadCount(unreadRes.data.count);
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'kullaniciAdi', 'rol', 'kullaniciId']);
            router.replace('/login');
          },
        },
      ]
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
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profilim</Text>
          <Text style={styles.headerSubtitle}>Hesap ayarlarınız ve yönetim</Text>
        </View>

        {/* Profil Kartı */}
        <View style={styles.profilCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.avatarGradient}
            >
              <Ionicons name="person" size={50} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.adSoyad}>{profil?.adSoyad}</Text>

          {/* ⭐ Daire No */}
          {profil?.daireNo && (
            <View style={styles.daireContainer}>
              <Ionicons name="home" size={18} color="#64748B" />
              <Text style={styles.daireText}>Daire: {profil.daireNo}</Text>
            </View>
          )}

          <Text style={styles.email}>{profil?.email}</Text>

          <View style={[styles.rolBadge, profil?.rol === 'ADMIN' ? styles.adminBadge : styles.userBadge]}>
            <Ionicons
              name={profil?.rol === 'ADMIN' ? 'shield-checkmark' : 'person'}
              size={16}
              color="#fff"
            />
            <Text style={styles.rolText}>
              {profil?.rol === 'ADMIN' ? 'Yönetici' : 'Site Sakini'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menü Listesi */}
      <View style={styles.menuWrapper}>
        <View style={styles.menuContainer}>
          {profil?.rol === 'ADMIN' && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/kullanici-list')}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                  <Ionicons name="people" size={22} color="#007AFF" />
                </View>
                <Text style={styles.menuText}>Kullanıcı Yönetimi</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/sikayet-listesi')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                <Ionicons name="list" size={22} color="#FF9500" />
              </View>
              <Text style={styles.menuText}>Taleplerim (Şikayet/Öneri)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/duyurular')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
                <Ionicons name="notifications" size={22} color="#34C759" />
              </View>
              <Text style={styles.menuText}>Duyurularım</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/mesajlar' as any)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                <Ionicons name="chatbubbles" size={22} color="#007AFF" />
              </View>
              <Text style={styles.menuText}>Mesajlarım</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCountText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/aidatlar')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                <Ionicons name="wallet" size={22} color="#007AFF" />
              </View>
              <Text style={styles.menuText}>Aidat Geçmişim</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push('/(tabs)/harcamalar')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                <Ionicons name="receipt" size={22} color="#007AFF" />
              </View>
              <Text style={styles.menuText}>Harcama Raporları</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Bilgilendirme Kartı */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#0066CC" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Site Duyuru Sistemi</Text>
            <Text style={styles.infoSubtitle}>Versiyon 1.0.0</Text>
          </View>
        </View>

        {/* Çıkış Butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
        </TouchableOpacity>
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
    paddingBottom: 120,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'flex-start',
    marginBottom: 30,
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
  profilCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: 'absolute',
    bottom: -110,
    left: 20,
    right: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  adSoyad: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  daireContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  daireText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  adminBadge: {
    backgroundColor: '#EF4444',
  },
  userBadge: {
    backgroundColor: '#3B82F6',
  },
  rolText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  menuWrapper: {
    marginTop: 130,
    paddingHorizontal: 20,
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,102,204,0.05)',
    marginVertical: 20,
    padding: 15,
    borderRadius: 15,
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,102,204,0.1)',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004499',
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});