import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,

} from 'react-native';
import { authApi } from './api/apiClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifreGoster, setSifreGoster] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);



  const handleLogin = async () => {
    if (!email || !sifre) {
      Alert.alert('Hata', 'Email ve şifre boş olamaz');
      return;
    }

    Keyboard.dismiss();
    setYukleniyor(true);

    try {
      const response = await authApi.login(email, sifre);
      const { token, kullaniciAdi, rol, id } = response.data;

      await AsyncStorage.multiSet([
        ['token', token],
        ['kullaniciAdi', kullaniciAdi],
        ['rol', rol],
        ['kullaniciId', id.toString()],
      ]);

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.response?.data?.message || 'Sunucuya bağlanılamadı');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0066CC', '#004499', '#003366']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Logo ve Başlık */}
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="home" size={50} color="#007AFF" />
              </View>
              <Text style={styles.title}>Site Duyuru</Text>
              <Text style={styles.subtitle}>Sistemi</Text>
              <Text style={styles.tagline}>Akıllı Site Yönetimi</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'email' && styles.inputContainerFocused
              ]}>
                <Ionicons
                  name="mail"
                  size={22}
                  color={focusedInput === 'email' ? '#007AFF' : '#999'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta Adresiniz"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Şifre */}
              <View style={[
                styles.inputContainer,
                focusedInput === 'sifre' && styles.inputContainerFocused
              ]}>
                <Ionicons
                  name="lock-closed"
                  size={22}
                  color={focusedInput === 'sifre' ? '#007AFF' : '#999'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={sifre}
                  onChangeText={setSifre}
                  secureTextEntry={!sifreGoster}
                  onFocus={() => setFocusedInput('sifre')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setSifreGoster(!sifreGoster)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={sifreGoster ? 'eye-off' : 'eye'}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>



              {/* Giriş Butonu */}
              <TouchableOpacity
                style={[styles.loginButton, yukleniyor && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={yukleniyor}
                activeOpacity={0.8}
              >
                {yukleniyor ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass" size={22} color="#fff" />
                    <Text style={styles.loginButtonText}>Giriş Yapılıyor...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="log-in" size={22} color="#fff" />
                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Alt Bilgi */}
            <View style={styles.footer}>
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.infoText}>
                  Demo hesaplar için sistem yöneticinize başvurun
                </Text>
              </View>
              <Text style={styles.versionText}>Versiyon 1.0.0</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>


    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: -5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingRight: 15,
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0c4e8',
    shadowOpacity: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
  },
  versionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 15,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});