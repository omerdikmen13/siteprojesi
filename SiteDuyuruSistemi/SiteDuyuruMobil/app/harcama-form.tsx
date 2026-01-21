import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { harcamaApi } from './api/apiClient';

export default function HarcamaForm() {
  const router = useRouter();
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState('');
  const [kategori, setKategori] = useState('Genel');
  const [yukleniyor, setYukleniyor] = useState(false);

  const kategoriler = [
    { id: 'Genel', label: 'Genel', icon: 'folder', color: '#007AFF' },
    { id: 'Bakım', label: 'Bakım', icon: 'construct', color: '#FF9500' },
    { id: 'Temizlik', label: 'Temizlik', icon: 'sparkles', color: '#5AC8FA' },
    { id: 'Güvenlik', label: 'Güvenlik', icon: 'shield', color: '#FF3B30' },
    { id: 'Diğer', label: 'Diğer', icon: 'apps', color: '#8E8E93' },
  ];

  const handleSubmit = async () => {
    if (!baslik.trim() || !tutar) {
      Alert.alert('Hata', 'Başlık ve tutar boş olamaz');
      return;
    }

    if (isNaN(Number(tutar)) || Number(tutar) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar giriniz');
      return;
    }

    setYukleniyor(true);
    try {
      const harcamaData = {
        baslik: baslik.trim(),
        aciklama: aciklama.trim(),
        tutar: parseFloat(tutar),
        kategori,
        tarih: new Date().toISOString().split('T')[0], // YYYY-MM-DD formatı
      };

      await harcamaApi.harcamaEkle(harcamaData);
      Alert.alert('Başarılı', 'Harcama eklendi');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Harcama eklenemedi');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Başlık */}
        <Text style={styles.label}>Başlık *</Text>
        <TextInput
          style={styles.input}
          placeholder="Harcama başlığı"
          value={baslik}
          onChangeText={setBaslik}
        />

        {/* Kategori Seçimi */}
        <Text style={styles.label}>Kategori *</Text>
        <View style={styles.kategoriContainer}>
          {kategoriler.map((kat) => (
            <TouchableOpacity
              key={kat.id}
              style={[
                styles.kategoriButton,
                kategori === kat.id && { backgroundColor: kat.color }
              ]}
              onPress={() => setKategori(kat.id)}
            >
              <Ionicons 
                name={kat.icon as any} 
                size={24} 
                color={kategori === kat.id ? '#fff' : kat.color} 
              />
              <Text style={[
                styles.kategoriText,
                kategori === kat.id && styles.kategoriTextActive
              ]}>
                {kat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tutar */}
        <Text style={styles.label}>Tutar (₺) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Harcama tutarı"
          value={tutar}
          onChangeText={setTutar}
          keyboardType="decimal-pad"
        />

        {/* Açıklama */}
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Harcama detayları (opsiyonel)"
          value={aciklama}
          onChangeText={setAciklama}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Önizleme */}
        {baslik && tutar && (
          <View style={styles.previewCard}>
            <View style={[styles.previewIcon, { backgroundColor: kategoriler.find(k => k.id === kategori)?.color + '20' }]}>
              <Ionicons 
                name={kategoriler.find(k => k.id === kategori)?.icon as any} 
                size={32} 
                color={kategoriler.find(k => k.id === kategori)?.color} 
              />
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewLabel}>Önizleme:</Text>
              <Text style={styles.previewBaslik}>{baslik}</Text>
              <Text style={styles.previewTutar}>{tutar} ₺</Text>
              <Text style={styles.previewKategori}>{kategori}</Text>
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
            {yukleniyor ? 'Kaydediliyor...' : 'Harcama Ekle'}
          </Text>
        </TouchableOpacity>

        {/* Bilgi Notu */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoNoteText}>
            Eklenen harcama tüm kullanıcılar tarafından görülebilir ve toplam harcama hesaplamalarına dahil olacaktır.
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  kategoriContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kategoriButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 8,
    minWidth: '30%',
  },
  kategoriText: {
    fontSize: 14,
    color: '#666',
  },
  kategoriTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  previewBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  previewTutar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 5,
  },
  previewKategori: {
    fontSize: 14,
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