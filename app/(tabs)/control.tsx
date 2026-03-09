import { JointSlider } from '@/components/JointSlider';
import { gripper as Gripper } from '@/components/gripper';
import { database, get, ref, set } from '@/lib/firebase';
import { JointAngles, RobotState } from '@/types/robot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FolderOpen, Play, Save } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ControlScreen() {
  const router = useRouter();
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [angles, setAngles] = useState<JointAngles>({
    base: 90,
    shoulder: 90,
    elbow: 90,
    wrist: 90,
    gripper: 90,
    finger: 90,   // ✅ added
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<JointAngles[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [stateName, setStateName] = useState('');
  const [savedStates, setSavedStates] = useState<Record<string, RobotState>>(
    {}
  );
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'custom' | 'infinite' | null>(null);
  const [repeatCount, setRepeatCount] = useState('');
  const stopPlaybackRef = useRef(false);

  useEffect(() => {
    checkDeviceConnection();
  }, []);

  useEffect(() => {
    if (deviceCode) {
      updateLiveAngles();
    }
  }, [angles, deviceCode]);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordedFrames((prev) => [...prev, { ...angles }]);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording, angles]);

  useEffect(() => {
    if (deviceCode) {
      loadSavedStates();
    }
  }, [deviceCode]);

  const checkDeviceConnection = async () => {
    const code = await AsyncStorage.getItem('deviceCode');
    if (!code) {
      Alert.alert('No Device', 'Please connect to a device first', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/'),
        },
      ]);
    } else {
      setDeviceCode(code);
    }
  };

  const updateLiveAngles = async () => {
    if (!deviceCode) return;

    try {
      const liveRef = ref(database, `robotArm/live/${deviceCode}`);
      await set(liveRef, angles);
    } catch (error) {
      console.error('Error updating live angles:', error);
    }
  };

  const handleAngleChange = (joint: keyof JointAngles, value: number) => {
    setAngles((prev) => ({ ...prev, [joint]: value }));
  };

  const startRecording = () => {
    setRecordedFrames([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setShowCreateModal(true);
  };

  const saveState = async () => {
    if (!stateName.trim() || !deviceCode) {
      Alert.alert('Error', 'Please enter a state name');
      return;
    }

    try {
      const stateData: RobotState = {
        name: stateName.trim(),
        timestamp: Date.now(),
        frames: recordedFrames,
      };

      const stateRef = ref(
        database,
        `robotArm/states/${deviceCode}/${stateName.trim()}`
      );
      await set(stateRef, stateData);

      Alert.alert('Success', 'State saved successfully!');
      setShowCreateModal(false);
      setStateName('');
      setRecordedFrames([]);
      loadSavedStates();
    } catch (error) {
      Alert.alert('Error', 'Failed to save state');
      console.error('Error saving state:', error);
    }
  };

  const loadSavedStates = async () => {
    if (!deviceCode) return;

    try {
      const statesRef = ref(database, `robotArm/states/${deviceCode}`);
      const snapshot = await get(statesRef);

      if (snapshot.exists()) {
        setSavedStates(snapshot.val());
      } else {
        setSavedStates({});
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const playState = async (
    stateKey: string,
    mode: 'custom' | 'infinite',
    count?: number
  ) => {
    const state = savedStates[stateKey];

    if (!state || !state.frames || state.frames.length === 0) {
      Alert.alert('Error', 'Invalid state data');
      return;
    }

    setSelectedState(stateKey);

    stopPlaybackRef.current = false;
    setIsPlaying(true);

    let loop = 0;

    while (true) {

      for (const frame of state.frames) {

        if (stopPlaybackRef.current) {
          setIsPlaying(false);
          return;
        }

        setAngles(frame);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      loop++;

      if (mode === 'custom' && count && loop >= count) {
        break;
      }
    }

    setIsPlaying(false);
  };

  const stopAction = () => {
    stopPlaybackRef.current = true;
    setIsPlaying(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Robot Control</Text>
          {deviceCode && (
            <Text style={styles.deviceCode}>Device: {deviceCode}</Text>
          )}
        </View>

        <View style={styles.slidersContainer}>
          <JointSlider
            label="Base"
            value={angles.base}
            onValueChange={(value) => handleAngleChange('base', value)}
            jointType="base"
          />
          <JointSlider
            label="Shoulder"
            value={angles.shoulder}
            onValueChange={(value) => handleAngleChange('shoulder', value)}
            jointType="shoulder"
          />
          <JointSlider
            label="Elbow"
            value={angles.elbow}
            onValueChange={(value) => handleAngleChange('elbow', value)}
            jointType="elbow"
          />
          <JointSlider
            label="Wrist"
            value={angles.wrist}
            onValueChange={(value) => handleAngleChange('wrist', value)}
            jointType="wrist"
          />
          <JointSlider
            label="Gripper"
            value={angles.gripper}
            onValueChange={(value) => handleAngleChange('gripper', value)}
            jointType="gripper"
          />
          <Gripper
            label="Finger"
            value={angles.finger}
            onValueChange={(value: number) => handleAngleChange('finger', value)}
            jointType="finger"
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.recordButton]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isPlaying}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {isRecording ? 'Stop Recording' : 'Create State'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.loadButton]}
            onPress={() => {
              loadSavedStates();
              setShowLoadModal(true);
            }}
            disabled={isPlaying || isRecording}
          >
            <FolderOpen size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Load State</Text>
          </TouchableOpacity>
        </View>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              Recording... ({recordedFrames.length} frames)
            </Text>
          </View>
        )}
        {isPlaying && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'red', margin: 20 }]}
            onPress={stopAction}
          >
            <Text style={styles.actionButtonText}>STOP</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save State</Text>
            <Text style={styles.modalSubtitle}>
              Recorded {recordedFrames.length} frames
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter state name"
              value={stateName}
              onChangeText={setStateName}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setStateName('');
                  setRecordedFrames([]);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveState}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLoadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Load State</Text>

            <ScrollView style={styles.statesList}>
              {Object.keys(savedStates).length === 0 ? (
                <Text style={styles.emptyText}>No saved states</Text>
              ) : (
                Object.keys(savedStates).map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.stateItem,
                      selectedState === key && styles.stateItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedState(key);
                      setShowLoadModal(false);
                      setShowPlayModal(true);
                    }}
                  >
                    <View>
                      <Text style={styles.stateName}>
                        {savedStates[key].name}
                      </Text>
                      <Text style={styles.stateInfo}>
                        {savedStates[key].frames?.length || 0} frames
                      </Text>
                    </View>
                    <Play size={20} color="#2563eb" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => setShowLoadModal(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showPlayModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>Playback Mode</Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton, { marginBottom: 10 }]}
              onPress={() => {
                setShowPlayModal(false);
                if (selectedState) playState(selectedState, 'infinite');
              }}
            >
              <Text style={styles.modalSaveText}>Repeat Till Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton, { marginBottom: 10 }]}
              onPress={() => setRepeatMode('custom')}
            >
              <Text style={styles.modalSaveText}>Custom Repeat</Text>
            </TouchableOpacity>

            {repeatMode === 'custom' && (
              <>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter repeat count"
                  keyboardType="numeric"
                  value={repeatCount}
                  onChangeText={setRepeatCount}
                />

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={() => {
                    setShowPlayModal(false);
                    if (selectedState)
                      playState(selectedState, 'custom', parseInt(repeatCount));
                  }}
                >
                  <Text style={styles.modalSaveText}>Start</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowPlayModal(false);
                setRepeatMode(null);
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  deviceCode: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  slidersContainer: {
    padding: 24,
    paddingTop: 8,
  },
  actionsContainer: {
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  recordButton: {
    backgroundColor: '#dc2626',
  },
  loadButton: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  recordingText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: '#2563eb',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statesList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  stateItemSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  stateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stateInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    padding: 20,
  },
});
