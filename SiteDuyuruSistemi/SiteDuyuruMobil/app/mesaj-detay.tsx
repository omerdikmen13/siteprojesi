import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mesajApi, profilApi } from './api/apiClient';

export default function MesajDetay() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [thread, setThread] = useState<any[]>([]);
    const [mesaj, setMesaj] = useState('');
    const [yukleniyor, setYukleniyor] = useState(true);
    const [gonderiliyor, setGonderiliyor] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadInfo();
    }, []);

    const loadInfo = async () => {
        try {
            const prof = await profilApi.profil();
            setUserId(prof.data.id);

            const res = await mesajApi.konusma(Number(id));
            if (res.data.success) {
                setThread(res.data.data);
                // Son mesajı okundu işaretle
                const sonMesaj = res.data.data[res.data.data.length - 1];
                if (sonMesaj && sonMesaj.gonderenId !== prof.data.id) {
                    await mesajApi.oku(sonMesaj.id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setYukleniyor(false);
        }
    };

    const handleGonder = async () => {
        if (!mesaj.trim()) return;
        setGonderiliyor(true);
        try {
            const root = thread[0];
            const res = await mesajApi.gonder({
                baslik: root.baslik,
                icerik: mesaj,
                anaMesajId: root.anaMesajId || root.id,
                aliciId: root.gonderenId === userId ? null : root.gonderenId, // Admin ise null veya karşı taraf
            });

            if (res.data.success) {
                setMesaj('');
                loadInfo(); // Yenile
            }
        } catch (error) {
            console.error(error);
        } finally {
            setGonderiliyor(false);
        }
    };

    const handleMesajSil = async (mesajId: number) => {
        const confirm = await new Promise((resolve) => {
            import('react-native').then(({ Alert }) => {
                Alert.alert(
                    'Mesajı Sil',
                    'Bu mesajı silmek istediğinize emin misiniz? Karşı tarafın ekranında "Mesaj silindi" yazacaktır.',
                    [
                        { text: 'Vazgeç', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Sil', onPress: () => resolve(true), style: 'destructive' },
                    ]
                );
            });
        });

        if (confirm) {
            try {
                await mesajApi.mesajSil(mesajId);
                loadInfo();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const renderBubble = ({ item }: any) => {
        const isMine = item.gonderenId === userId;
        return (
            <View style={[styles.bubbleContainer, isMine ? styles.bubbleMine : styles.bubbleOthers]}>
                {!isMine && (
                    <Text style={styles.senderInfo}>
                        {item.gonderenAdSoyad} · <Text style={styles.roleTag}>{item.gonderenRol === 'ADMIN' ? 'Yönetici' : 'Sakin'}</Text>
                    </Text>
                )}
                <View style={[styles.bubble, isMine ? styles.bubbleBgMine : styles.bubbleBgOthers]}>
                    <Text style={[styles.messageText, isMine && styles.textWhite, item.silindi && styles.textSilindi]}>
                        {item.silindi ? 'Bu mesaj silindi' : item.icerik}
                    </Text>
                </View>
                <View style={styles.bubbleFooter}>
                    <Text style={styles.timeText}>
                        {new Date(item.tarih).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMine && !item.silindi && (
                        <TouchableOpacity onPress={() => handleMesajSil(item.id)} style={styles.msgDeleteBtn}>
                            <Ionicons name="trash-outline" size={14} color="#fca5a5" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (yukleniyor) return <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{thread[0]?.baslik}</Text>
                    <Text style={styles.headerSubtitle}>{thread.length} mesajlık konuşma</Text>
                </View>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={thread}
                renderItem={renderBubble}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Mesajınızı yazın..."
                    value={mesaj}
                    onChangeText={setMesaj}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !mesaj.trim() && styles.sendBtnDisabled]}
                    onPress={handleGonder}
                    disabled={gonderiliyor || !mesaj.trim()}
                >
                    {gonderiliyor ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={24} color="#fff" />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    headerTextContainer: { marginLeft: 16, flex: 1 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    backBtn: { padding: 4 },
    listContent: { padding: 16, paddingBottom: 24 },
    bubbleContainer: { marginBottom: 16, maxWidth: '85%' },
    bubbleMine: { alignSelf: 'flex-end' },
    bubbleOthers: { alignSelf: 'flex-start' },
    bubble: { padding: 12, borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    bubbleBgMine: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
    bubbleBgOthers: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, color: '#1e293b', lineHeight: 20 },
    textWhite: { color: '#fff' },
    senderInfo: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '600' },
    roleTag: { color: '#6366f1' },
    timeText: { fontSize: 10, color: '#94a3b8', alignSelf: 'flex-end' },
    bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
    msgDeleteBtn: { marginLeft: 8 },
    textSilindi: { color: '#94a3b8', fontStyle: 'italic' },
    inputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, color: '#1e293b' },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    sendBtnDisabled: { backgroundColor: '#94a3b8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
