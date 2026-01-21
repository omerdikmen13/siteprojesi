import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { geminiApi } from './api/apiClient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function GeminiChat() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [mesajlar, setMesajlar] = useState<Message[]>([
    {
      id: '1',
      text: 'Merhaba! Size nasıl yardımcı olabilirim? Duyurular, aidatlar veya harcamalar hakkında soru sorabilirsiniz.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    // Yeni mesaj geldiğinde en alta scroll yap
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [mesajlar]);

  const handleSend = async () => {
    if (!inputText.trim() || yukleniyor) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMesajlar((prev) => [...prev, userMessage]);
    setInputText('');
    setYukleniyor(true);

    try {
      // Soruyu genel soru endpoint'ine gönder
      const response = await geminiApi.genelSoru(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.cevap,
        isUser: false,
        timestamp: new Date(),
      };

      setMesajlar((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        isUser: false,
        timestamp: new Date(),
      };
      setMesajlar((prev) => [...prev, errorMessage]);
    } finally {
      setYukleniyor(false);
    }
  };

  const hizliSorular = [
    'Ödenmemiş aidatlar var mı?',
    'Bu ayki duyurular neler?',
    'Toplam harcama ne kadar?',
    'En son harcama ne?',
  ];

  const handleHizliSoru = (soru: string) => {
    setInputText(soru);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Ionicons name="sparkles" size={24} color="#fff" />
          <Text style={styles.headerTitle}>AI Asistan</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {mesajlar.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.isUser ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            {!msg.isUser && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color="#007AFF" />
              </View>
            )}
            
            <View
              style={[
                styles.messageBubble,
                msg.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.isUser ? styles.userMessageText : styles.aiMessageText,
              ]}>
                {msg.text}
              </Text>
              <Text style={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>

            {msg.isUser && (
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
            )}
          </View>
        ))}

        {yukleniyor && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>AI düşünüyor...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      {mesajlar.length === 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Hızlı Sorular:</Text>
          <View style={styles.quickQuestionsRow}>
            {hizliSorular.map((soru, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestionButton}
                onPress={() => handleHizliSoru(soru)}
              >
                <Text style={styles.quickQuestionText}>{soru}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Bir soru sorun..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || yukleniyor) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || yukleniyor}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 15,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  quickQuestionsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  quickQuestionsRow: {
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 8,
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#007AFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});