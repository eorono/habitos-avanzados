import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useHabitStore } from '../store/useHabitStore';
import { Habit } from '../types/habit';
import { isWithinInterval, parseISO } from 'date-fns';

export const exportHabitsData = async (filterDateRange?: { start: Date; end: Date }) => {
  try {
    const habitsStore = useHabitStore.getState().habits;
    
    let dbToExport = { ...habitsStore };

    if (filterDateRange) {
      // Filtrar el historial según el rango de fechas
      const filtered: Record<string, Habit> = {};
      
      for (const [id, habit] of Object.entries(dbToExport)) {
        const filteredHistory: Record<string, any> = {};
        for (const [dateStr, historyData] of Object.entries(habit.history)) {
          const entryDate = parseISO(dateStr);
          if (isWithinInterval(entryDate, { start: filterDateRange.start, end: filterDateRange.end })) {
            filteredHistory[dateStr] = historyData;
          }
        }
        filtered[id] = { ...habit, history: filteredHistory };
      }
      dbToExport = filtered;
    }

    const jsonString = JSON.stringify(dbToExport, null, 2);
    
    // Crear archivo temporal
    const fileUri = `${FileSystem.documentDirectory}habitflow_export_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Compartir el archivo
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar datos de hábitos',
        UTI: 'public.json'
      });
    } else {
      alert('La exportación de archivos no está disponible en este dispositivo.');
    }

  } catch (error) {
    console.error('Error exportando datos:', error);
    alert('Ocurrió un error al exportar.');
  }
};
