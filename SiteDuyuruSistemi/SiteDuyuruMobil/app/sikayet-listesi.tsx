
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { sikayetApi } from './api/apiClient';
import { LinearGradient } from 'expo-linear-gradient';

export default function SikayetListesi() {
    const router = useRouter();
    const [sikayetler, setSikayetler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [yenileniyor, setYenileniyor] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const id = await AsyncStorage.getItem('kullaniciId');
            if (id) {
                const response = await sikayetApi.kullaniciSikayetleri(parseInt(id));
                setSikayetler(response.data.data);
            }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BEKLEMEDE': return '#FFA500'; // Orange
            case 'INCELENIYOR': return '#17a2b8'; // Info/Blue
            case 'COZULDU': return '#28a745'; // Green
            case 'REDDEDILDI': return '#dc3545'; // Red
            default: return '#6c757d'; // Grey
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'BEKLEMEDE': return 'Beklemede';
            case 'INCELENIYOR': return 'İnceleniyor';
            case 'COZULDU': return 'Çözüldü';
            case 'REDDEDILDI': return 'Reddedildi';
            default: return status;
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.date}>{new Date(item.olusturmaTarihi).toLocaleDateString('tr-TR')}</Text>
                <View style={[styles.badge, { backgroundColor: item.tur === 'ONERI' ? '#e6f4ea' : '#fbeaea' }]}>
                    <Text style={{ color: item.tur === 'ONERI' ? '#28a745' : '#dc3545', fontWeight: 'bold', fontSize: 12 }}>
                        {item.tur === 'ONERI' ? 'Öneri' : 'Şikayet'}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>{item.baslik}</Text>
            <Text style={styles.description}>{item.aciklama}</Text>

            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.durum) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.durum)}</Text>
                </View>
            </View>

            {item.adminNotu && (
                <View style={styles.adminNote}>
                    <Text style={styles.adminNoteLabel}>Yönetici Yanıtı:</Text>
                    <Text style={styles.adminNoteText}>{item.adminNotu}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0066CC', '#004499', '#003366']}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Taleplerim</Text>
                </View>
            </LinearGradient>

            {yukleniyor ? (
                <ActivityIndicator style={styles.loader} size="large" color="#0066CC" />
            ) : (
                <FlatList
                    data={sikayetler}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>Henüz bir talebiniz bulunmuyor.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/sikayet-form')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    loader: { marginTop: 50 },
    list: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    date: { color: '#666', fontSize: 12 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    description: { fontSize: 14, color: '#555', marginBottom: 10 },
    statusContainer: { alignItems: 'flex-start', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    adminNote: {
        backgroundColor: '#f1f8ff',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    adminNoteLabel: { fontWeight: 'bold', fontSize: 12, color: '#007AFF', marginBottom: 2 },
    adminNoteText: { fontSize: 13, color: '#333' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 10 },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
    }
});
