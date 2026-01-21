import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mesajApi } from './api/apiClient';
import { useFocusEffect } from '@react-navigation/native';

export default function Mesajlar() {
    const router = useRouter();
    const [konusmalar, setKonusmalar] = useState<any[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [yenileniyor, setYenileniyor] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const res = await mesajApi.konusmalar();
            if (res.data.success) {
                setKonusmalar(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setYukleniyor(false);
            setYenileniyor(false);
        }
    };

    const onRefresh = () => {
        setYenileniyor(true);
        loadData();
    };

    const handleKonusmaSil = async (id: number) => {
        const confirm = await new Promise((resolve) => {
            import('react-native').then(({ Alert }) => {
                Alert.alert(
                    'Konuşmayı Sil',
                    'Bu konuşmayı kendi listenizden silmek istediğinize emin misiniz? Karşı tarafın mesajları etkilenmeyecektir.',
                    [
                        { text: 'Vazgeç', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Sil', onPress: () => resolve(true), style: 'destructive' },
                    ]
                );
            });
        });

        if (confirm) {
            try {
                await mesajApi.konusmaSil(id);
                loadData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const renderKonusma = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.msgCard, !item.okundu && styles.unreadCard]}
            onPress={() => router.push({ pathname: '/mesaj-detay' as any, params: { id: item.id } })}
        >
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.gonderenAdSoyad?.substring(0, 1) || '?'}</Text>
                </View>
                {!item.okundu && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.cardHeader}>
                    <Text style={styles.senderName} numberOfLines={1}>{item.gonderenAdSoyad}</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.tarih).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                <View style={styles.roleRow}>
                    <Text style={styles.roleTag}>{item.gonderenRol === 'ADMIN' ? 'Yönetici' : 'Sakin'}</Text>
                    {item.gonderenDaire && <Text style={styles.daireInfo}>Daire: {item.gonderenDaire}</Text>}
                </View>

                <Text style={styles.subjectText} numberOfLines={1}>{item.baslik}</Text>
                <Text style={styles.previewText} numberOfLines={1}>{item.icerik}</Text>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity onPress={() => handleKonusmaSil(item.anaMesajId || item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mesajlarım</Text>
            </LinearGradient>

            {yukleniyor && !yenileniyor ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={konusmalar}
                    renderItem={renderKonusma}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>Henüz bir mesaj bulunmuyor.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/mesaj-gonder' as any)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 16 },
    backBtn: { padding: 4 },
    listContainer: { padding: 16 },
    msgCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: 'transparent'
    },
    unreadCard: {
        backgroundColor: '#f1f5ff',
        borderLeftColor: '#6366f1'
    },
    avatarContainer: { marginRight: 12, position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '600', color: '#64748b' },
    unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' },
    contentContainer: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    senderName: { fontWeight: '700', fontSize: 15, color: '#1e293b', flex: 1 },
    dateText: { fontSize: 12, color: '#94a3b8' },
    roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    roleTag: { fontSize: 10, fontWeight: '700', color: '#6366f1', backgroundColor: '#eef2ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase', marginRight: 8 },
    daireInfo: { fontSize: 11, color: '#64748b' },
    subjectText: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 2 },
    previewText: { fontSize: 13, color: '#64748b' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', marginTop: 16, fontSize: 16 },
    fab: { position: 'absolute', right: 24, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    actionContainer: { flexDirection: 'row', alignItems: 'center' },
    deleteBtn: { padding: 8, marginRight: 4 }
});
