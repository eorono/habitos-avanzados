import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types/habit';

// Configuración base de notificaciones (cómo se muestran cuando la app está en primer plano)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habitflow-reminders', {
      name: 'Recordatorios de Hábitos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });
  }

  return true;
}

export async function scheduleHabitReminders(habit: Habit) {
  // Primero cancelamos las que ya existan para este hábito
  await cancelHabitReminders(habit.id);

  if (!habit.reminders || habit.reminders.length === 0) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  for (const reminderTime of habit.reminders) {
    const [hours, minutes] = reminderTime.split(':').map(Number);

    try {
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
    } catch (error) {
      console.warn('Error al programar notificación:', error);
    }
  }
}

export async function cancelHabitReminders(habitId: string) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.habitId === habitId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}
