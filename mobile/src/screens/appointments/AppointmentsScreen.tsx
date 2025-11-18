import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, FAB, useTheme, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';

const AppointmentsScreen: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState('today');

  const mockAppointments = [
    {
      id: '1',
      time: '09:00',
      patient: 'Marie Dupont',
      type: 'Consultation',
      status: 'confirmed',
    },
    {
      id: '2',
      time: '10:30',
      patient: 'Jean Martin',
      type: 'Suivi',
      status: 'in-progress',
    },
    {
      id: '3',
      time: '14:00',
      patient: 'Sophie Bernard',
      type: 'Première consultation',
      status: 'confirmed',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={value}
          onValueChange={setValue}
          buttons={[
            { value: 'today', label: "Aujourd'hui" },
            { value: 'week', label: 'Semaine' },
            { value: 'month', label: 'Mois' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <Icon name="calendar-check" size={32} color={theme.colors.primary} />
              <View>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                  12
                </Text>
                <Text variant="bodySmall">Total</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Card.Content style={styles.statContent}>
              <Icon name="check-circle" size={32} color={theme.colors.success} />
              <View>
                <Text variant="headlineMedium" style={{ color: theme.colors.success }}>
                  8
                </Text>
                <Text variant="bodySmall">Confirmés</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Rendez-vous
        </Text>

        {mockAppointments.map((apt) => (
          <Card key={apt.id} style={styles.appointmentCard}>
            <Card.Content>
              <View style={styles.appointmentHeader}>
                <View
                  style={[
                    styles.timeBox,
                    {
                      backgroundColor:
                        apt.status === 'in-progress'
                          ? theme.colors.warning
                          : theme.colors.success,
                    },
                  ]}
                >
                  <Text variant="labelLarge" style={{ color: '#FFF' }}>
                    {apt.time}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text variant="titleMedium">{apt.patient}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {apt.type}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="calendar-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => console.log('Add appointment')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  filterContainer: {
    padding: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  appointmentCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    padding: spacing.md,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
});

export default AppointmentsScreen;
