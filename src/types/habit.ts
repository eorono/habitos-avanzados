export interface HabitModification {
  date: string; // ISO String (ej. '2023-10-05T00:00:00.000Z')
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  goal: string; // ej: "3 veces", "diario", "leer 15 mins"
  frequency: 'daily' | 'weekly' | 'monthly';
  reminders: string[]; // Tiempos, ej. "08:00"
  history: Record<string, HabitModification>; // Key es la fecha 'YYYY-MM-DD' para búsquedas rápidas
  createdAt: string;
}
