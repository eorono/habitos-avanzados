import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Habit } from '../src/types/habit';
import { useHabitStore } from '../src/store/useHabitStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Clock, Save } from 'lucide-react-native';

export default function CreateHabit() {
  const router = useRouter();
  const { addHabit } = useHabitStore();

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const [reminders, setReminders] = useState<Date[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || !goal.trim()) {
      alert('Por favor completa el nombre y el objetivo.');
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      goal: goal.trim(),
      frequency,
      reminders: reminders.map(r => format(r, 'HH:mm')),
      history: {},
      createdAt: new Date().toISOString(),
    };

    addHabit(newHabit);
    router.back();
  };

  const addReminder = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setReminders(prev => [...prev, selectedDate]);
    }
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre del Hábito</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Leer, Gimnasio, Beber Agua"
        placeholderTextColor="#64748b"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Objetivo (Descripción corta)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 15 páginas, 1 hora, 2 litros"
        placeholderTextColor="#64748b"
        value={goal}
        onChangeText={setGoal}
      />

      <Text style={styles.label}>Frecuencia</Text>
      <View style={styles.frequencyContainer}>
        {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
          <Pressable
            key={freq}
            style={[
              styles.frequencyButton,
              frequency === freq && styles.frequencyButtonActive
            ]}
            onPress={() => setFrequency(freq)}
          >
            <Text style={[
              styles.frequencyText,
              frequency === freq && styles.frequencyTextActive
            ]}>
              {freq === 'daily' ? 'Diaria' : freq === 'weekly' ? 'Semanal' : 'Mensual'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Recordatorios</Text>
      <View style={styles.remindersList}>
        {reminders.map((r, i) => (
          <Pressable key={i} onPress={() => removeReminder(i)} style={styles.reminderChip}>
            <Clock size={16} color="#f8fafc" style={{ marginRight: 6 }} />
            <Text style={styles.reminderText}>{format(r, 'HH:mm')}</Text>
          </Pressable>
        ))}
        <Pressable 
          style={styles.addReminderBtn}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.addReminderText}>+ Añadir Hora</Text>
        </Pressable>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={addReminder}
        />
      )}

      <Pressable style={styles.saveButton} onPress={handleCreate}>
        <Save color="#fff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.saveButtonText}>Guardar Hábito</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  frequencyButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  frequencyText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  remindersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reminderText: {
    color: '#f8fafc',
    fontWeight: '500',
  },
  addReminderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addReminderText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
