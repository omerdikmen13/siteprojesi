
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { aidatApi, odemeApi } from './api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function OdemeEkrani() {
    const { id, tutar: paramTutar, donem: paramDonem } = useLocalSearchParams(); // Aidat ID ve ön bilgiler
    const router = useRouter();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [aidat, setAidat] = useState<any>({
        id: id ? Number(id) : null,
        tutar: paramTutar ? Number(paramTutar) : 0,
        donem: paramDonem || ''
    });
    const [yukleniyor, setYukleniyor] = useState(true);
    const [odemeIslemi, setOdemeIslemi] = useState(false);

    useEffect(() => {
        loadAidatDetay();
    }, [id]);

    const loadAidatDetay = async () => {
        try {
            if (!id) return;
            const response = await aidatApi.aidatDetay(Number(id));
            const data = response.data.data;
            if (data) {
                setAidat(data);
            }
        } catch (error) {
            console.error(error);
            // Hata olsa bile params'taki bilgilerle devam edebiliriz
        } finally {
            setYukleniyor(false);
        }
    };

    const handlePayPress = async () => {
        if (!aidat || !aidat.id) {
            Alert.alert('Hata', 'Aidat bilgisi eksik');
            return;
        }
        setOdemeIslemi(true);

        try {
            const kullaniciId = await AsyncStorage.getItem('kullaniciId');

            // 1. Backend'den PaymentIntent oluştur
            const response = await odemeApi.createPaymentIntent({
                aidatId: aidat.id,
                tutar: aidat.tutar,
                kullaniciId: kullaniciId ? parseInt(kullaniciId) : null
            });

            const { clientSecret } = response.data;

            if (!clientSecret) {
                Alert.alert('Hata', 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
                setOdemeIslemi(false);
                return;
            }

            // 2. Payment Sheet'i başlat
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'SiteDuyuru',
                paymentIntentClientSecret: clientSecret,
                returnURL: 'siteduyuru://stripe-redirect',
                appearance: {
                    colors: {
                        primary: '#0066CC',
                    },
                    shapes: {
                        borderRadius: 12,
                    }
                }
            });

            if (initError) {
                Alert.alert('Hata', initError.message);
                setOdemeIslemi(false);
                return;
            }

            // 3. Ödeme ekranını göster
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code !== 'Canceled') {
                    Alert.alert('Ödeme Başarısız', paymentError.message);
                }
                setOdemeIslemi(false);
            } else {
                // 4. Ödeme Başarılı -> Backend'e bildir (Kayıt için)
                await odemeApi.confirmPayment({
                    paymentId: clientSecret.split('_secret')[0],
                    aidatId: aidat.id,
                    tutar: aidat.tutar,
                    kullaniciId: kullaniciId ? parseInt(kullaniciId) : null
                });

                Alert.alert('Başarılı', 'Ödeme başarıyla alındı!', [
                    { text: 'Tamam', onPress: () => router.replace('/(tabs)/aidatlar') }
                ]);
                setOdemeIslemi(false);
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Hata', error.response?.data?.message || 'Bir sorun oluştu');
            setOdemeIslemi(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <LinearGradient
                colors={['#0066CC', '#004499', '#003366']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ödeme Onayı</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Toplam Ödecek Tutar</Text>
                    <Text style={styles.amountValue}>{aidat.tutar} ₺</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* Ödeme Özeti Kartı */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fatura Özeti</Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                            <Ionicons name="calendar-outline" size={20} color="#0066CC" />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>Aidat Dönemi</Text>
                            <Text style={styles.detailValue}>{aidat.donem || (aidat.ay + ' ' + aidat.yil)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                            <Ionicons name="business-outline" size={20} color="#0066CC" />
                        </View>
                        <View style={styles.detailText}>
                            <Text style={styles.detailLabel}>Açıklama</Text>
                            <Text style={styles.detailValue}>Site Aidat Ödemesi</Text>
                        </View>
                    </View>
                </View>

                {/* Bilgi Kutusu */}
                <View style={styles.infoBox}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                    <View style={styles.infoBoxContent}>
                        <Text style={styles.infoBoxTitle}>Güvenli Ödeme</Text>
                        <Text style={styles.infoBoxText}>
                            Bilgileriniz Stripe tarafından 256-bit SSL ile korunur. Uygulamamız kart bilgilerinizi asla saklamaz.
                        </Text>
                    </View>
                </View>

                {/* Öde Butonu */}
                <TouchableOpacity
                    style={[styles.payButton, odemeIslemi && styles.payButtonDisabled]}
                    onPress={handlePayPress}
                    disabled={odemeIslemi}
                >
                    <LinearGradient
                        colors={['#0066CC', '#004499']}
                        style={styles.payGradient}
                    >
                        {odemeIslemi ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="lock-closed" size={20} color="#fff" />
                                <Text style={styles.payButtonText}>Şimdi Güvenle Öde</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Vazgeç</Text>
                </TouchableOpacity>

                <View style={styles.footerBrand}>
                    <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png' }}
                        style={styles.stripeLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 25,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    amountContainer: {
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#fff',
    },
    content: {
        padding: 25,
        marginTop: -30,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 25,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(0,102,204,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 4,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        padding: 20,
        borderRadius: 20,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.12)',
        marginBottom: 30,
    },
    infoBoxContent: {
        flex: 1,
        marginLeft: 15,
    },
    infoBoxTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#065F46',
        marginBottom: 4,
    },
    infoBoxText: {
        fontSize: 13,
        color: '#065F46',
        lineHeight: 18,
        opacity: 0.8,
    },
    payButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    payButtonDisabled: {
        opacity: 0.7,
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
    cancelButton: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    cancelText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '700',
    },
    footerBrand: {
        alignItems: 'center',
        marginTop: 40,
        opacity: 0.4,
    },
    stripeLogo: {
        width: 100,
        height: 40,
    }
});
