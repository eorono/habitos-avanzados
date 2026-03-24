import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/habit';
import { scheduleHabitReminders, cancelHabitReminders } from '../services/notifications';

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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
