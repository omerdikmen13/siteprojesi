import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mesajApi, kullaniciApi, profilApi } from './api/apiClient';

export default function MesajGonder() {
    const router = useRouter();
    const [baslik, setBaslik] = useState('');
    const [icerik, setIcerik] = useState('');
    const [rol, setRol] = useState('');
    const [kullanicilar, setKullanicilar] = useState<any[]>([]);
    const [seciliKullanici, setSeciliKullanici] = useState<number | null>(null);
    const [isToplu, setIsToplu] = useState(false);
    const [gonderiliyor, setGonderiliyor] = useState(false);

    useEffect(() => {
        loadInfo();
    }, []);

    const loadInfo = async () => {
        try {
            const prof = await profilApi.profil();
            setRol(prof.data.rolu);

            if (prof.data.rolu === 'ADMIN') {
                const resK = await kullaniciApi.tumKullanicilar();
                setKullanicilar(resK.data.filter((u: any) => u.rolu !== 'ADMIN'));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGonder = async () => {
        if (!baslik.trim() || !icerik.trim()) {
            Alert.alert('Hata', 'Lütfen konu ve mesaj içeriği giriniz.');
            return;
        }
        if (rol === 'ADMIN' && !isToplu && !seciliKullanici) {
            Alert.alert('Hata', 'Lütfen bir alıcı seçiniz.');
            return;
        }

        setGonderiliyor(true);
        try {
            const res = await mesajApi.gonder({
                baslik,
                icerik,
                toplu: rol === 'ADMIN' ? isToplu : false,
                aliciId: rol === 'ADMIN' ? (isToplu ? null : seciliKullanici) : null,
            });

            if (res.data.success) {
                Alert.alert('Başarılı', 'Mesajınız gönderildi.', [
                    { text: 'Tamam', onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Mesaj gönderilemedi.');
        } finally {
            setGonderiliyor(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yeni Mesaj</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    {rol === 'ADMIN' && (
                        <View style={styles.section}>
                            <View style={styles.switchRow}>
                                <View>
                                    <Text style={styles.label}>Tüm Sakinlere Gönder</Text>
                                    <Text style={styles.hint}>Genel duyuru ve bilgilendirme için.</Text>
                                </View>
                                <Switch
                                    value={isToplu}
                                    onValueChange={setIsToplu}
                                    trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
                                    thumbColor={isToplu ? '#6366f1' : '#f8fafc'}
                                />
                            </View>

                            {!isToplu && (
                                <View style={styles.userList}>
                                    <Text style={styles.label}>Alıcı Sakin Seçin</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                                        {kullanicilar.map((u: any) => (
                                            <TouchableOpacity
                                                key={u.id}
                                                style={[styles.chip, seciliKullanici === u.id && styles.chipActive]}
                                                onPress={() => setSeciliKullanici(u.id)}
                                            >
                                                <Text style={[styles.chipText, seciliKullanici === u.id && styles.chipTextActive]}>
                                                    {u.adSoyad} (D:{u.daireNo})
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}

                    {rol !== 'ADMIN' && (
                        <View style={styles.adminInfo}>
                            <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
                            <Text style={styles.adminText}>Alıcı: Site Yönetimi</Text>
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Konu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mesaj konusu (Örn: Arıza bildirimi)"
                            value={baslik}
                            onChangeText={setBaslik}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mesajınız</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detayları buraya yazınız..."
                            value={icerik}
                            onChangeText={setIcerik}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.gonderBtn, gonderiliyor && styles.disabledBtn]}
                        onPress={handleGonder}
                        disabled={gonderiliyor}
                    >
                        {gonderiliyor ? <ActivityIndicator color="#fff" /> : <Text style={styles.gonderBtnText}>Mesajı Gönder</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, paddingTop: 60, flexDirection: 'row', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 16 },
    backBtn: { padding: 4 },
    scroll: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    section: { marginBottom: 24 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    hint: { fontSize: 12, color: '#64748b' },
    chips: { marginTop: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    chipText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    chipTextActive: { color: '#fff' },
    adminInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', padding: 12, borderRadius: 12, marginBottom: 24 },
    adminText: { marginLeft: 8, color: '#6366f1', fontWeight: '600', fontSize: 14 },
    formGroup: { marginBottom: 20 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1e293b' },
    textArea: { height: 120 },
    gonderBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
    gonderBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    disabledBtn: { backgroundColor: '#94a3b8' },
    userList: { marginTop: 8 }
});
