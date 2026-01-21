import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { sikayetApi } from './api/apiClient';

export default function SikayetForm() {
    const router = useRouter();
    const [yukleniyor, setYukleniyor] = useState(false);
    const [form, setForm] = useState({
        tur: 'SIKAYET',
        baslik: '',
        aciklama: '',
        kategori: '',
    });

    const handleGonder = async () => {
        if (!form.baslik || !form.aciklama) {
            Alert.alert('Hata', 'Lütfen başlık ve açıklama alanlarını doldurunuz.');
            return;
        }

        setYukleniyor(true);
        try {
            const kullaniciId = await AsyncStorage.getItem('kullaniciId');
            const data = {
                ...form,
                kullaniciId: parseInt(kullaniciId || '0'),
            };

            const response = await sikayetApi.gonder(data);
            if (response.data.success) {
                Alert.alert('Başarılı', 'Mesajınız başarıyla iletildi.', [
                    { text: 'Tamam', onPress: () => router.back() }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Hata', error?.response?.data?.message || 'Mesaj gönderilemedi.');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
                <LinearGradient
                    colors={['#0066CC', '#004499', '#003366']}
                    style={styles.headerGradient}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Şikayet & Öneri</Text>
                        <Text style={styles.headerSubtitle}>Görüşleriniz bizim için değerlidir</Text>
                    </View>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Tür Seçiniz</Text>
                    <View style={styles.turButtons}>
                        <TouchableOpacity
                            style={[
                                styles.turButton,
                                form.tur === 'SIKAYET' && styles.turButtonActive
                            ]}
                            onPress={() => setForm({ ...form, tur: 'SIKAYET' })}
                        >
                            <Ionicons
                                name="alert-circle"
                                size={20}
                                color={form.tur === 'SIKAYET' ? '#fff' : '#64748B'}
                            />
                            <Text style={[
                                styles.turText,
                                form.tur === 'SIKAYET' && styles.turTextActive
                            ]}>Şikayet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.turButton,
                                form.tur === 'ONERI' && styles.turButtonActive
                            ]}
                            onPress={() => setForm({ ...form, tur: 'ONERI' })}
                        >
                            <Ionicons
                                name="bulb"
                                size={20}
                                color={form.tur === 'ONERI' ? '#fff' : '#64748B'}
                            />
                            <Text style={[
                                styles.turText,
                                form.tur === 'ONERI' && styles.turTextActive
                            ]}>Öneri</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Konu Başlığı</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Kısa bir başlık yazın..."
                        placeholderTextColor="#94A3B8"
                        value={form.baslik}
                        onChangeText={(text) => setForm({ ...form, baslik: text })}
                    />

                    <Text style={styles.label}>Kategori (Opsiyonel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Temizlik, Güvenlik, Aidat..."
                        placeholderTextColor="#94A3B8"
                        value={form.kategori}
                        onChangeText={(text) => setForm({ ...form, kategori: text })}
                    />

                    <Text style={styles.label}>Açıklama</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Detaylıca açıklayınız..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={form.aciklama}
                        onChangeText={(text) => setForm({ ...form, aciklama: text })}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, yukleniyor && styles.disabledButton]}
                        onPress={handleGonder}
                        disabled={yukleniyor}
                    >
                        {yukleniyor ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>Formu Gönder</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        marginBottom: 20,
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
    formContainer: {
        padding: 20,
        marginTop: -20,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 10,
        marginTop: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    textArea: {
        height: 120,
        paddingTop: 15,
    },
    turButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    turButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    turButtonActive: {
        backgroundColor: '#0066CC',
        borderColor: '#0066CC',
    },
    turText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    turTextActive: {
        color: '#fff',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0066CC',
        padding: 18,
        borderRadius: 15,
        marginTop: 30,
        gap: 10,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
});
