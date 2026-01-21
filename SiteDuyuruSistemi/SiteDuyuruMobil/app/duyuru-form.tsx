import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { duyuruApi } from './api/apiClient';

export default function DuyuruForm() {
  const router = useRouter();
  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [onemli, setOnemli] = useState(false);
  const [anketMi, setAnketMi] = useState(false);
  const [anketSecenekleri, setAnketSecenekleri] = useState<string[]>(['', '']);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleAddSecenek = () => {
    setAnketSecenekleri([...anketSecenekleri, '']);
  };

  const handleRemoveSecenek = (index: number) => {
    const yeniSecenekler = anketSecenekleri.filter((_, i) => i !== index);
    setAnketSecenekleri(yeniSecenekler);
  };

  const handleSecenekChange = (index: number, value: string) => {
    const yeniSecenekler = [...anketSecenekleri];
    yeniSecenekler[index] = value;
    setAnketSecenekleri(yeniSecenekler);
  };

  const handleSubmit = async () => {
    if (!baslik.trim() || !icerik.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik boş olamaz');
      return;
    }

    if (anketMi) {
      const doluSecenekler = anketSecenekleri.filter(s => s.trim());
      if (doluSecenekler.length < 2) {
        Alert.alert('Hata', 'Anket için en az 2 seçenek girmelisiniz');
        return;
      }
    }

    setYukleniyor(true);
    try {
      const duyuruData: any = {
        baslik: baslik.trim(),
        icerik: icerik.trim(),
        onemli,
        anketMi,
      };

      if (anketMi) {
        duyuruData.anketSecenekleri = anketSecenekleri.filter(s => s.trim());
      }

      await duyuruApi.duyuruEkle(duyuruData);
      Alert.alert('Başarılı', 'Duyuru eklendi');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Duyuru eklenemedi');
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
          placeholder="Duyuru başlığı"
          value={baslik}
          onChangeText={setBaslik}
        />

        {/* İçerik */}
        <Text style={styles.label}>İçerik *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Duyuru içeriği"
          value={icerik}
          onChangeText={setIcerik}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Önemli Switch */}
        <View style={styles.switchContainer}>
          <View style={styles.switchLeft}>
            <Ionicons name="alert-circle" size={24} color={onemli ? '#FF3B30' : '#999'} />
            <Text style={styles.switchLabel}>Önemli Duyuru</Text>
          </View>
          <Switch
            value={onemli}
            onValueChange={setOnemli}
            trackColor={{ false: '#ddd', true: '#FF3B30' }}
            thumbColor={onemli ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Anket Switch */}
        <View style={styles.switchContainer}>
          <View style={styles.switchLeft}>
            <Ionicons name="bar-chart" size={24} color={anketMi ? '#007AFF' : '#999'} />
            <Text style={styles.switchLabel}>Anket Ekle</Text>
          </View>
          <Switch
            value={anketMi}
            onValueChange={setAnketMi}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor={anketMi ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Anket Seçenekleri */}
        {anketMi && (
          <View style={styles.anketContainer}>
            <Text style={styles.label}>Anket Seçenekleri</Text>
            
            {anketSecenekleri.map((secenek, index) => (
              <View key={index} style={styles.secenekRow}>
                <TextInput
                  style={[styles.input, styles.secenekInput]}
                  placeholder={`Seçenek ${index + 1}`}
                  value={secenek}
                  onChangeText={(value) => handleSecenekChange(index, value)}
                />
                {anketSecenekleri.length > 2 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveSecenek(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleAddSecenek}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Seçenek Ekle</Text>
            </TouchableOpacity>
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
            {yukleniyor ? 'Kaydediliyor...' : 'Duyuru Yayınla'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 8,
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
    height: 150,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  anketContainer: {
    marginTop: 15,
  },
  secenekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  secenekInput: {
    flex: 1,
    marginTop: 0,
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
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
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});