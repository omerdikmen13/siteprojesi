import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { harcamaApi } from '../api/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Harcamalar() {
    const router = useRouter();
    const [harcamalar, setHarcamalar] = useState<any[]>([]);
    const [yenileniyor, setYenileniyor] = useState(false);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [toplamHarcama, setToplamHarcama] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await harcamaApi.tumHarcamalar();
            const data = response.data.data;
            setHarcamalar(data);

            const toplam = data.reduce(
                (sum: number, h: any) => sum + (h.tutar || 0),
                0
            );
            setToplamHarcama(toplam);
        } catch (error) {
            Alert.alert('Hata', 'Harcamalar yüklenemedi');
        } finally {
            setYukleniyor(false);
        }
    };

    const onRefresh = async () => {
        setYenileniyor(true);
        await loadData();
        setYenileniyor(false);
    };

    const getKategoriIcon = (kategori: string) => {
        const icons: Record<string, any> = {
            Genel: 'folder',
            Bakım: 'construct',
            Temizlik: 'sparkles',
            Güvenlik: 'shield',
            Diğer: 'apps',
        };

        return icons[kategori] || 'cash';
    };

    const renderHarcama = ({ item }: any) => (
        <TouchableOpacity
            style={styles.harcamaCard}
            onPress={() =>
                router.push(`/harcama-detay?id=${item.id}`)
            }
        >
            <View style={styles.harcamaHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getKategoriIcon(item.kategori)}
                        size={24}
                        color="#007AFF"
                    />
                </View>

                <View style={styles.harcamaInfo}>
                    <Text style={styles.harcamaBaslik}>{item.baslik}</Text>
                    <Text style={styles.harcamaKategori}>{item.kategori}</Text>
                </View>

                <Text style={styles.harcamaTutar}>{item.tutar} ₺</Text>
            </View>

            {item.aciklama && (
                <Text style={styles.harcamaAciklama} numberOfLines={2}>
                    {item.aciklama}
                </Text>
            )}

            <View style={styles.harcamaFooter}>
                <Ionicons name="calendar" size={16} color="#999" />
                <Text style={styles.harcamaTarih}>
                    {new Date(item.tarih).toLocaleDateString('tr-TR')}
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
                    <Text style={styles.headerTitle}>Harcamalar</Text>
                    <Text style={styles.headerSubtitle}>Site giderleri ve raporlar</Text>
                </View>

                {/* Toplam Harcama Kartı (Header İçinde) */}
                <View style={styles.toplamCard}>
                    <View style={styles.toplamContent}>
                        <View style={styles.statsIcon}>
                            <Ionicons name="stats-chart" size={24} color="#007AFF" />
                        </View>
                        <View>
                            <Text style={styles.toplamLabel}>Toplam Harcama</Text>
                            <Text style={styles.toplamTutar}>
                                {toplamHarcama.toFixed(2)} ₺
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={harcamalar}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderHarcama}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={yenileniyor}
                        onRefresh={onRefresh}
                        tintColor="#fff"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            Henüz harcama kaydı yok
                        </Text>
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
        paddingBottom: 80,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'flex-start',
        marginBottom: 20,
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
    toplamCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        position: 'absolute',
        bottom: -40,
        left: 20,
        right: 20,
    },
    toplamContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    statsIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(0,102,204,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toplamLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    toplamTutar: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 2,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    harcamaCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,102,204,0.05)',
    },
    harcamaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    harcamaInfo: {
        flex: 1,
    },
    harcamaBaslik: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    harcamaKategori: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 4,
    },
    harcamaTutar: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF3B30',
    },
    harcamaAciklama: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        lineHeight: 20,
    },
    harcamaFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    harcamaTarih: {
        fontSize: 12,
        color: '#999',
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
