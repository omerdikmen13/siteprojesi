import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { duyuruApi } from '../api/apiClient';

export default function Duyurular() {
  const router = useRouter();
  const [duyurular, setDuyurular] = useState([]);
  const [rol, setRol] = useState('');
  const [yenileniyor, setYenileniyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRol = await AsyncStorage.getItem('rol');
      setRol(userRol || '');

      const response = await duyuruApi.tumDuyurular();
      setDuyurular(response.data.data);
    } catch (error) {
      Alert.alert('Hata', 'Duyurular yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  const onRefresh = async () => {
    setYenileniyor(true);
    await loadData();
    setYenileniyor(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDuyuru = ({ item }: any) => (
    <TouchableOpacity
      style={styles.duyuruCard}
      onPress={() => router.push(`/duyuru-detay?id=${item.id}`)}
    >
      <View style={styles.duyuruHeader}>
        <View style={styles.duyuruTitleRow}>
          {item.onemli && (
            <Ionicons name="alert-circle" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.duyuruBaslik} numberOfLines={2}>
            {item.baslik}
          </Text>
        </View>
        {item.anketMi && (
          <View style={styles.anketBadge}>
            <Ionicons name="bar-chart" size={16} color="#fff" />
            <Text style={styles.anketText}>Anket</Text>
          </View>
        )}
      </View>

      <Text style={styles.duyuruIcerik} numberOfLines={3}>
        {item.icerik}
      </Text>

      <View style={styles.duyuruFooter}>
        <Ionicons name="time" size={16} color="#999" />
        <Text style={styles.duyuruTarih}>
          {formatDate(item.olusturmaTarihi)}
        </Text>
      </View>
    </TouchableOpacity>
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
      <LinearGradient
        colors={['#0066CC', '#004499', '#003366']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Duyurular</Text>
          <Text style={styles.headerSubtitle}>Sitemizden en güncel haberler</Text>
        </View>
      </LinearGradient>

      {rol === 'ADMIN' && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push('/duyuru-form')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <FlatList
        data={duyurular}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderDuyuru}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={yenileniyor} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz duyuru yok</Text>
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
  duyuruCard: {
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
  duyuruHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  duyuruTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  duyuruBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  anketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  anketText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  duyuruIcerik: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  duyuruFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  duyuruTarih: {
    fontSize: 12,
    color: '#999',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});