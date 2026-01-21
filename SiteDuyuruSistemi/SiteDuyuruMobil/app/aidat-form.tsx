import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { aidatApi } from './api/apiClient';

export default function AidatForm() {
  const router = useRouter();
  const [ay, setAy] = useState('');
  const [yil, setYil] = useState(new Date().getFullYear().toString());
  const [tutar, setTutar] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const aylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const handleSubmit = async () => {
    if (!ay || !yil || !tutar) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return;
    }

    if (isNaN(Number(tutar)) || Number(tutar) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar giriniz');
      return;
    }

    setYukleniyor(true);
    try {
      const aidatData = {
        ay,
        yil: parseInt(yil),
        tutar: parseFloat(tutar),
        durum: 'ODENMEDI',
      };

      await aidatApi.aidatEkle(aidatData);
      Alert.alert('Başarılı', 'Aidat eklendi');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Aidat eklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Ay Seçimi */}
        <Text style={styles.label}>Ay *</Text>
        <View style={styles.ayContainer}>
          {aylar.map((ayAdi) => (
            <TouchableOpacity
              key={ayAdi}
              style={[
                styles.ayButton,
                ay === ayAdi && styles.ayButtonActive
              ]}
              onPress={() => setAy(ayAdi)}
            >
              <Text style={[
                styles.ayButtonText,
                ay === ayAdi && styles.ayButtonTextActive
              ]}>
                {ayAdi}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Yıl */}
        <Text style={styles.label}>Yıl *</Text>
        <TextInput
          style={styles.input}
          placeholder="Yıl (örn: 2024)"
          value={yil}
          onChangeText={setYil}
          keyboardType="number-pad"
          maxLength={4}
        />

        {/* Tutar */}
        <Text style={styles.label}>Tutar (₺) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Aidat tutarı"
          value={tutar}
          onChangeText={setTutar}
          keyboardType="decimal-pad"
        />

        {/* Önizleme */}
        {ay && yil && tutar && (
          <View style={styles.previewCard}>
            <Ionicons name="eye" size={24} color="#007AFF" />
            <View style={styles.previewContent}>
              <Text style={styles.previewLabel}>Önizleme:</Text>
              <Text style={styles.previewText}>
                {ay} {yil} - {tutar} ₺
              </Text>
            </View>
          </View>
        )}

        {/* Submit Butonu */}
        <TouchableOpacity
          style={[styles.submitButton, yukleniyor && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={yukleniyor}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>
            {yukleniyor ? 'Kaydediliyor...' : 'Aidat Ekle'}
          </Text>
        </TouchableOpacity>

        {/* Bilgi Notu */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoNoteText}>
            Eklenen aidat tüm kullanıcılar tarafından görülebilir ve "Ödenmedi" durumunda olacaktır.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: '30%',
    alignItems: 'center',
  },
  ayButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  ayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  ayButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    gap: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});