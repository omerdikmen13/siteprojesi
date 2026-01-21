import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { kullaniciApi } from './api/apiClient';

// TİP TANIMLARI EKLE
interface Kullanici {
  id: number;
  adSoyad: string;
  email: string;
  rolu: 'ADMIN' | 'KULLANICI';
  daireNo?: string;  // ⭐ YENİ
}

export default function KullaniciList() {
  const router = useRouter();
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [modalGorunum, setModalGorunum] = useState(false);
  const [yeniKullanici, setYeniKullanici] = useState({
    adSoyad: '',
    email: '',
    sifre: '',
    rolu: 'KULLANICI' as 'ADMIN' | 'KULLANICI',
    daireNo: '',  // ⭐ YENİ
  });

  useEffect(() => {
    checkAdmin();
    loadData();
  }, []);

  const checkAdmin = async () => {
    const rol = await AsyncStorage.getItem('rol');
    if (rol !== 'ADMIN') {
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim yetkiniz yok');
      router.back();
    }
  };

  const loadData = async () => {
    try {
      const response = await kullaniciApi.tumKullanicilar();
      setKullanicilar(response.data.data);
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcılar yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleEkle = async () => {
    if (!yeniKullanici.adSoyad || !yeniKullanici.email || !yeniKullanici.sifre) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return;
    }

    try {
      await kullaniciApi.kullaniciEkle(yeniKullanici);
      Alert.alert('Başarılı', 'Kullanıcı eklendi');
      setModalGorunum(false);
      setYeniKullanici({
        adSoyad: '',
        email: '',
        sifre: '',
        rolu: 'KULLANICI',
        daireNo: '', // ⭐ YENİ
      });
      loadData();
    } catch (error: any) {  // ⭐ any ekle
      Alert.alert('Hata', error?.response?.data?.message || 'Kullanıcı eklenemedi');
    }
  };

  const renderKullanici = ({ item }: { item: Kullanici }) => (
    <View style={styles.kullaniciCard}>
      <View style={styles.avatarCircle}>
        <Ionicons
          name={item.rolu === 'ADMIN' ? 'shield' : 'person'}
          size={32}
          color={item.rolu === 'ADMIN' ? '#FF3B30' : '#007AFF'}
        />
      </View>

      <View style={styles.kullaniciInfo}>
        <Text style={styles.kullaniciAd}>{item.adSoyad}</Text>

        {/* ⭐ Daire No Göster */}
        {item.daireNo && (
          <View style={styles.daireRow}>
            <Ionicons name="home" size={14} color="#666" />
            <Text style={styles.daireText}>Daire: {item.daireNo}</Text>
          </View>
        )}

        <Text style={styles.kullaniciEmail}>{item.email}</Text>

        <View style={[styles.rolBadge, item.rolu === 'ADMIN' ? styles.adminBadge : styles.userBadge]}>
          <Text style={styles.rolText}>
            {item.rolu === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (yukleniyor) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={kullanicilar}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderKullanici}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz kullanıcı yok</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setModalGorunum(true)}
      >
        <Ionicons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalGorunum}
        animationType="slide"
        transparent
        onRequestClose={() => setModalGorunum(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Kullanıcı Ekle</Text>
              <TouchableOpacity onPress={() => setModalGorunum(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              value={yeniKullanici.adSoyad}
              onChangeText={(text) => setYeniKullanici({ ...yeniKullanici, adSoyad: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={yeniKullanici.email}
              onChangeText={(text) => setYeniKullanici({ ...yeniKullanici, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* ⭐ YENİ: Daire No */}
            <TextInput
              style={styles.input}
              placeholder="Daire No (örn: A1, B12, 105)"
              value={yeniKullanici.daireNo}
              onChangeText={(text) => setYeniKullanici({ ...yeniKullanici, daireNo: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={yeniKullanici.sifre}
              onChangeText={(text) => setYeniKullanici({ ...yeniKullanici, sifre: text })}
              secureTextEntry
            />

            <View style={styles.rolContainer}>
              <Text style={styles.rolLabel}>Rol:</Text>
              <View style={styles.rolButtons}>
                <TouchableOpacity
                  style={[
                    styles.rolButton,
                    yeniKullanici.rolu === 'KULLANICI' && styles.rolButtonActive
                  ]}
                  onPress={() => setYeniKullanici({ ...yeniKullanici, rolu: 'KULLANICI' })}
                >
                  <Text style={[
                    styles.rolButtonText,
                    yeniKullanici.rolu === 'KULLANICI' && styles.rolButtonTextActive
                  ]}>
                    Kullanıcı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rolButton,
                    yeniKullanici.rolu === 'ADMIN' && styles.rolButtonActive
                  ]}
                  onPress={() => setYeniKullanici({ ...yeniKullanici, rolu: 'ADMIN' })}
                >
                  <Text style={[
                    styles.rolButtonText,
                    yeniKullanici.rolu === 'ADMIN' && styles.rolButtonTextActive
                  ]}>
                    Yönetici
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.ekleButton} onPress={handleEkle}>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.ekleButtonText}>Kullanıcı Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  listContainer: {
    padding: 15,
  },
  kullaniciCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  kullaniciInfo: {
    flex: 1,
  },
  kullaniciAd: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  daireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  daireText: {
    fontSize: 13,
    color: '#666',
  },
  kullaniciEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rolBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#FF3B30',
  },
  userBadge: {
    backgroundColor: '#007AFF',
  },
  rolText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rolContainer: {
    marginBottom: 20,
  },
  rolLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rolButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rolButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  rolButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  rolButtonText: {
    fontSize: 16,
    color: '#666',
  },
  rolButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ekleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  ekleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
