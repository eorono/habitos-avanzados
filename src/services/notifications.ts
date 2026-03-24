import { Platform } from 'react-native';
import { Habit } from '../types/habit';

// expo-notifications no es compatible con Expo Go en SDK 53+.
// Toda la funcionalidad se desactiva gracefully para evitar crashes.
let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[Notifications] expo-notifications no disponible en este entorno (Expo Go). Las notificaciones están desactivadas.');
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habitflow-reminders', {
        name: 'Recordatorios de Hábitos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
      });
    }

    return true;
  } catch (e) {
    console.warn('[Notifications] Error al solicitar permisos:', e);
    return false;
  }
}

export async function scheduleHabitReminders(habit: Habit) {
  if (!Notifications) return;
  if (!habit.reminders || habit.reminders.length === 0) return;

  try {
    await cancelHabitReminders(habit.id);
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    for (const reminderTime of habit.reminders) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `¡Es hora de: ${habit.name}!`,
          body: `Tu objetivo: ${habit.goal}. ¡No rompas tu racha!`,
          data: { habitId: habit.id },
          sound: true,
        },
        trigger: {
          channelId: 'habitflow-reminders',
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.warn('[Notifications] Error al programar recordatorio:', e);
  }
}

export async function cancelHabitReminders(habitId: string) {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (e) {
    console.warn('[Notifications] Error al cancelar recordatorio:', e);
  }
}
