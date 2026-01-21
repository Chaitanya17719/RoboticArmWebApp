import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { JointType } from '@/types/robot';

interface JointSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  jointType: JointType;
}

export function JointSlider({
  label,
  value,
  onValueChange,
}: JointSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value)}°</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={180}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#2563eb"
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor="#2563eb"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
