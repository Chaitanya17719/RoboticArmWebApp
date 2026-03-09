import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Keyboard } from 'lucide-react-native';
import { QRScanner } from '@/components/QRScanner';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, ref, get } from '@/lib/firebase';

export default function LoadDeviceScreen() {
  const router = useRouter();
  const [deviceCode, setDeviceCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const validateAndConnect = async (code: string) => {
  if (!code || code.trim().length === 0) {
    setError('Please enter a device code');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const trimmedCode = code.trim();

    // 🔥 CORRECT FIREBASE PATH
    const deviceRef = ref(database, `robotArm/live/${trimmedCode}`);
    const snapshot = await get(deviceRef);

    if (!snapshot.exists()) {
      setError('Invalid device code. Device not found.');
      setLoading(false);
      return;
    }

    await AsyncStorage.setItem('deviceCode', trimmedCode);

    Alert.alert('Success', 'Device connected successfully!', [
      {
        text: 'OK',
        onPress: () => router.replace('/(tabs)/control'),
      },
    ]);
  } catch (err) {
    console.error(err);
    setError('Failed to connect to device.');
  } finally {
    setLoading(false);
  }
};

  const handleManualEntry = () => {
    validateAndConnect(deviceCode);
  };

  const handleQRScan = (data: string) => {
    setShowScanner(false);
    setDeviceCode(data);
    validateAndConnect(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Load Device</Text>
        <Text style={styles.subtitle}>
          Connect to your robotic arm by scanning a QR code or entering the
          device code manually
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Device Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter device code"
            value={deviceCode}
            onChangeText={(text) => {
              setDeviceCode(text);
              setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleManualEntry}
          disabled={loading}
        >
          <Keyboard size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {loading ? 'Connecting...' : 'Connect with Code'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowScanner(true)}
          disabled={loading}
        >
          <QrCode size={20} color="#2563eb" />
          <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
