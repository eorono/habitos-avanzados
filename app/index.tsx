import { View, Text, StyleSheet, Pressable, FlatList, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { PlusCircle, CheckCircle, Circle, Download } from 'lucide-react-native';
import { useHabitStore } from '../src/store/useHabitStore';
import { exportHabitsData } from '../src/services/export';
import { format, startOfDay, subDays } from 'date-fns';

export default function Home() {
  const router = useRouter();
  const { habits, toggleHabitCompletion } = useHabitStore();
  
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const habitList = Object.values(habits);

  const handleToggle = (id: string) => {
    toggleHabitCompletion(id, todayStr);
  };

  const handleExport = () => {
    Alert.alert('Exportar Datos', '¿Qué periodo deseas exportar?', [
      { text: 'Todo el historial', onPress: () => exportHabitsData() },
      { text: 'Últimos 30 días', onPress: () => {
        exportHabitsData({ start: subDays(new Date(), 30), end: new Date() });
      }},
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <Pressable onPress={handleExport} style={styles.headerExportButton}>
              <Download color="#f8fafc" size={24} />
            </Pressable>
          ),
        }}
      />
      {habitList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tienes hábitos configurados.</Text>
          <Text style={styles.emptySubtext}>Comienza creando tu primer hábito para mejorar tu rutina.</Text>
        </View>
      ) : (
        <FlatList
          data={habitList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isCompleted = item.history[todayStr]?.completed ?? false;
            
            return (
              <Pressable 
                style={styles.habitCard} 
                onPress={() => router.push(`/habit/${item.id}`)}
              >
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{item.name}</Text>
                  <Text style={styles.habitMeta}>
                    {item.frequency === 'daily' ? 'Diario' : item.frequency === 'weekly' ? 'Semanal' : 'Mensual'} • {item.goal}
                  </Text>
                </View>

                {/* Check action */}
                <Pressable onPress={() => handleToggle(item.id)} style={styles.checkButton}>
                  {isCompleted ? (
                    <CheckCircle color="#10b981" size={32} />
                  ) : (
                    <Circle color="#64748b" size={32} />
                  )}
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}

      {/* FAB (Floating Action Button) */}
      <Pressable 
        style={styles.fab} 
        onPress={() => router.push('/create')}
      >
        <PlusCircle color="#fff" size={32} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  habitMeta: {
    fontSize: 14,
    color: '#94a3b8',
  },
  checkButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#3b82f6',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  headerExportButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  }
});
