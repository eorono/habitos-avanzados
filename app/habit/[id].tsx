import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHabitStore } from '../../src/store/useHabitStore';
import { calculateStreaks, getHabitInsights } from '../../src/utils/analytics';
import { Calendar } from 'react-native-calendars';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, deleteHabit } = useHabitStore();

  const habit = habits[id || ''];

  const { currentStreak, bestStreak, completionRate } = useMemo(
    () => (habit ? calculateStreaks(habit) : { currentStreak: 0, bestStreak: 0, completionRate: 0 }),
    [habit]
  );
  const insights = useMemo(() => (habit ? getHabitInsights(habit) : ''), [habit]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (!habit) return marks;
    Object.values(habit.history).forEach((h) => {
      if (h.completed) {
        marks[h.date] = { selected: true, selectedColor: '#10b981' };
      }
    });
    return marks;
  }, [habit]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const _data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      labels.push(format(d, 'eeie').substring(0, 1));
      _data.push(habit?.history[dateStr]?.completed ? 1 : 0);
    }
    return { labels, datasets: [{ data: _data }] };
  }, [habit]);

  if (!habit) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Hábito no encontrado</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Eliminar Hábito', '¿Estás seguro de que deseas eliminar este hábito? Se perderá todo el historial.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        deleteHabit(habit.id);
        router.back();
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{habit.name}</Text>
          <Text style={styles.subtitle}>{habit.goal} • {habit.frequency === 'daily' ? 'Diario' : 'Semanal'}</Text>
        </View>
        <Pressable onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" color="#ef4444" size={24} />
        </Pressable>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flame" color="#f59e0b" size={28} style={styles.statIcon} />
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Racha Actual</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" color="#3b82f6" size={28} style={styles.statIcon} />
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statLabel}>Mejor Racha</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="pulse" color="#10b981" size={28} style={styles.statIcon} />
          <Text style={styles.statValue}>{Math.round(completionRate)}%</Text>
          <Text style={styles.statLabel}>Constancia</Text>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb-outline" color="#fbbf24" size={20} />
          <Text style={styles.insightTitle}>Insights de IA Local</Text>
        </View>
        <Text style={styles.insightText}>{insights}</Text>
      </View>

      {/* Calendar */}
      <Text style={styles.sectionTitle}>Historial</Text>
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          theme={{
            calendarBackground: '#1e293b',
            textSectionTitleColor: '#94a3b8',
            dayTextColor: '#f8fafc',
            todayTextColor: '#3b82f6',
            monthTextColor: '#f8fafc',
            arrowColor: '#3b82f6',
          }}
        />
      </View>

      {/* Chart */}
      <Text style={styles.sectionTitle}>Tendencia de los Últimos 7 Días</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#1e293b',
            backgroundGradientFrom: '#1e293b',
            backgroundGradientTo: '#1e293b',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // emerald green
            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#10b981'
            }
          }}
          bezier
          style={{
            borderRadius: 16
          }}
          fromZero
        />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f8fafc',
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  insightsContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginLeft: 8,
  },
  insightText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 12,
    marginTop: 8,
  },
  calendarContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  }
});
