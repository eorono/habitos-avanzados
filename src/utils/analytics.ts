import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Habit, HabitModification } from '../types/habit';

export const calculateStreaks = (habit: Habit) => {
  const historyKeys = Object.keys(habit.history).sort((a, b) => b.localeCompare(a));
  
  if (historyKeys.length === 0) {
    return { currentStreak: 0, bestStreak: 0, completionRate: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let totalCompleted = 0;

  const today = startOfDay(new Date());
  let daysEvaluated = 0;

  // Encontrar la fecha de inicio del hábito o la más antigua en el historial
  const firstEntryDateStr = historyKeys[historyKeys.length - 1];
  const firstDate = startOfDay(parseISO(firstEntryDateStr));
  let currentDateToCheck = today;

  // Calculamos la racha iterando hacia atrás desde hoy
  let brokeCurrentStreak = false;

  while (currentDateToCheck >= firstDate) {
    const dateStr = format(currentDateToCheck, 'yyyy-MM-dd');
    const isCompleted = habit.history[dateStr]?.completed;
    daysEvaluated++;

    if (isCompleted) {
      tempStreak++;
      totalCompleted++;
      if (!brokeCurrentStreak) {
        currentStreak++;
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
      // Si no completó hoy y no completó ayer, rompemos la racha actual.
      // Permitimos que la racha no se rompa si solo falta "hoy", para que no castigue antes de terminar el día actual.
      if (currentDateToCheck < today) {
        brokeCurrentStreak = true;
      }
    }
    
    currentDateToCheck = subDays(currentDateToCheck, 1);
  }

  const completionRate = daysEvaluated > 0 ? (totalCompleted / daysEvaluated) * 100 : 0;

  return {
    currentStreak,
    bestStreak,
    completionRate: Math.round(completionRate),
  };
};

export const getHabitInsights = (habit: Habit) => {
  // Analizar en qué día de la semana suele fallar más
  const failedDaysOfWeek = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 // 0 = Domingo, 1 = Lunes...
  };
  
  Object.values(habit.history).forEach((entry) => {
    if (!entry.completed) {
      const day = parseISO(entry.date).getDay();
      failedDaysOfWeek[day as keyof typeof failedDaysOfWeek]++;
    }
  });

  let worstDay = 0;
  let maxFails = -1;

  Object.entries(failedDaysOfWeek).forEach(([day, fails]) => {
    if (fails > maxFails) {
      maxFails = fails;
      worstDay = parseInt(day);
    }
  });

  const daysNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (maxFails > 1) {
    return `Tiendes a fallar los ${daysNames[worstDay]}s. ¡Intenta prepararte con antelación o configurar un recordatorio extra!`;
  }
  
  return '¡Vas por buen camino y mantienes constancia!';
};
