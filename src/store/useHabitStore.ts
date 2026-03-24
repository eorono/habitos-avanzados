import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { Habit } from '../types/habit';
import { scheduleHabitReminders, cancelHabitReminders } from '../services/notifications';

// Instancia de MMKV para el almacenamiento cifrado y rápido
// @ts-ignore
export const storage = new MMKV({
  id: 'habitflow-storage',
  // Opcional: encryptionKey: 'my-encryption-key' - Se podría derivar de una frase de paso si se requiere súper privacidad.
});

// Adaptador de Zustand para MMKV
const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

interface HabitStore {
  habits: Record<string, Habit>;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: {},
      
      addHabit: (habit) => {
        scheduleHabitReminders(habit);
        set((state) => ({
          habits: { ...state.habits, [habit.id]: habit }
        }));
      },
      
      updateHabit: (id, updatedFields) => {
        set((state) => {
          const updatedHabit = { ...state.habits[id], ...updatedFields };
          // Re-programar con nuevos datos
          if (updatedFields.reminders || updatedFields.name || updatedFields.goal) {
            scheduleHabitReminders(updatedHabit);
          }
          return {
            habits: { ...state.habits, [id]: updatedHabit }
          };
        });
      },
      
      deleteHabit: (id) => {
        cancelHabitReminders(id);
        set((state) => {
          const newHabits = { ...state.habits };
          delete newHabits[id];
          return { habits: newHabits };
        });
      },
      
      toggleHabitCompletion: (habitId, dateString) => set((state) => {
        const habit = state.habits[habitId];
        if (!habit) return state;

        const currentHistory = habit.history[dateString];
        const isCompleted = currentHistory ? !currentHistory.completed : true;

        const updatedHabit = {
          ...habit,
          history: {
            ...habit.history,
            [dateString]: {
              date: dateString,
              completed: isCompleted,
            }
          }
        };

        return {
          habits: {
            ...state.habits,
            [habitId]: updatedHabit
          }
        };
      })
    }),
    {
      name: 'habitflow-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
