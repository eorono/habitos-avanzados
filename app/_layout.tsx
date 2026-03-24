import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#111827', // dark slate
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0f172a', // very dark slate
          }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'HabitFlow',
            headerLargeTitle: true,
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Nuevo Hábito',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="habit/[id]" 
          options={{ 
            title: 'Detalle',
          }} 
        />
      </Stack>
    </>
  );
}
