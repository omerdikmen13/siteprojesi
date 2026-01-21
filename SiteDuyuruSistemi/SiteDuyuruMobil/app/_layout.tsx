import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51SoKJB1g8yPRgDzCxLQt9YZvMTXHoPdklJh8lKJsWc7zljwthQm9tFt5EW3B4MHF6lQoPQPnxSCd8chrfBl7p6QV00miS6F2XF"
      merchantIdentifier="merchant.com.siteduyuru" // Opsiyonel (Apple Pay için)
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="duyuru-detay"
          options={{
            headerShown: true,
            title: 'Duyuru Detayı',
            headerBackTitle: 'Geri'
          }}
        />

        <Stack.Screen
          name="duyuru-form"
          options={{
            headerShown: true,
            title: 'Yeni Duyuru',
            presentation: 'modal'
          }}
        />

        <Stack.Screen
          name="aidat-detay"
          options={{
            headerShown: true,
            title: 'Aidat Detayı'
          }}
        />

        <Stack.Screen
          name="harcama-detay"
          options={{
            headerShown: true,
            title: 'Harcama Detayı'
          }}
        />

        <Stack.Screen
          name="kullanici-list"
          options={{
            headerShown: true,
            title: 'Kullanıcı Yönetimi'
          }}
        />

        <Stack.Screen
          name="gemini-chat"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />

        <Stack.Screen
          name="odeme-ekrani"
          options={{
            headerShown: true,
            title: 'Aidat Ödemesi',
            presentation: 'modal'
          }}
        />
      </Stack>
    </StripeProvider>
  );
}
