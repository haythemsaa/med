import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Surface, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../theme/theme';

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View>
          <Text variant="titleMedium" style={{ color: theme.colors.onPrimary, opacity: 0.9 }}>
            Bonjour,
          </Text>
          <Text variant="headlineMedium" style={{ color: theme.colors.onPrimary }}>
            Dr. {user?.firstName} {user?.lastName}
          </Text>
        </View>
        <Icon name="account-circle" size={50} color={theme.colors.onPrimary} />
      </Surface>

      {/* Premium Badge */}
      <View style={styles.premiumBanner}>
        <Surface
          style={[styles.premiumCard, { backgroundColor: theme.colors.success }]}
          elevation={2}
        >
          <Icon name="star" size={24} color="#FFF" />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text variant="titleMedium" style={{ color: '#FFF', fontWeight: '600' }}>
              Toutes les fonctionnalités Premium
            </Text>
            <Text variant="bodySmall" style={{ color: '#FFF', opacity: 0.9 }}>
              100% GRATUITES - Économisez 3,684€/an vs Doctolib
            </Text>
          </View>
        </Surface>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="account-multiple"
          title="Patients"
          value="248"
          color={theme.colors.primary}
          backgroundColor={theme.colors.primaryContainer}
        />
        <StatCard
          icon="calendar-check"
          title="Aujourd'hui"
          value="12"
          color={theme.colors.success}
          backgroundColor="#E8F5E9"
        />
        <StatCard
          icon="clock-alert"
          title="En attente"
          value="3"
          color={theme.colors.warning}
          backgroundColor="#FFF3E0"
        />
        <StatCard
          icon="robot"
          title="IA Active"
          value="ON"
          color={theme.colors.tertiary}
          backgroundColor={theme.colors.tertiaryContainer}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Actions rapides
        </Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="calendar-plus"
            title="Nouveau RDV"
            color={theme.colors.primary}
          />
          <ActionCard
            icon="account-plus"
            title="Nouveau Patient"
            color={theme.colors.success}
          />
          <ActionCard
            icon="file-document"
            title="Consultation"
            color={theme.colors.tertiary}
          />
          <ActionCard
            icon="robot"
            title="Assistant IA"
            color={theme.colors.prescription}
            badge="PRO"
          />
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Rendez-vous du jour
        </Text>
        <AppointmentCard
          time="09:00"
          patientName="Marie Dupont"
          type="Consultation"
          status="confirmed"
        />
        <AppointmentCard
          time="10:30"
          patientName="Jean Martin"
          type="Suivi"
          status="in-progress"
        />
        <AppointmentCard
          time="14:00"
          patientName="Sophie Bernard"
          type="Première consultation"
          status="confirmed"
        />
      </View>

      {/* Premium Features */}
      <View style={[styles.section, { marginBottom: spacing.xxl }]}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Fonctionnalités Premium (GRATUITES)
        </Text>
        <PremiumFeatureCard
          icon="robot"
          title="Assistant IA Consultation"
          description="Transcription, résumés et lettres médicales automatiques"
          tag="79€/mois chez Doctolib"
        />
        <PremiumFeatureCard
          icon="dna"
          title="Antécédents Familiaux"
          description="Arbre généalogique médical complet"
          tag="Premium"
        />
        <PremiumFeatureCard
          icon="shield-alert"
          title="Allergies Avancées"
          description="6 types d'allergènes, tests cutanés, désensibilisation"
          tag="Premium"
        />
      </View>
    </ScrollView>
  );
};

const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string;
  color: string;
  backgroundColor: string;
}> = ({ icon, title, value, color, backgroundColor }) => (
  <Surface style={[styles.statCard, { backgroundColor }]} elevation={1}>
    <Icon name={icon} size={32} color={color} />
    <Text variant="headlineMedium" style={{ color, fontWeight: '700', marginTop: spacing.xs }}>
      {value}
    </Text>
    <Text variant="bodySmall" style={{ color }}>{title}</Text>
  </Surface>
);

const ActionCard: React.FC<{
  icon: string;
  title: string;
  color: string;
  badge?: string;
}> = ({ icon, title, color, badge }) => (
  <Surface style={styles.actionCard} elevation={1}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={28} color={color} />
    </View>
    <Text variant="bodySmall" style={styles.actionTitle}>
      {title}
    </Text>
    {badge && (
      <Chip mode="flat" compact style={styles.actionBadge} textStyle={{ fontSize: 8 }}>
        {badge}
      </Chip>
    )}
  </Surface>
);

const AppointmentCard: React.FC<{
  time: string;
  patientName: string;
  type: string;
  status: string;
}> = ({ time, patientName, type, status }) => {
  const theme = useTheme();
  const statusColor =
    status === 'confirmed'
      ? theme.colors.success
      : status === 'in-progress'
      ? theme.colors.warning
      : theme.colors.onSurfaceVariant;

  return (
    <Card style={styles.appointmentCard}>
      <Card.Content style={styles.appointmentContent}>
        <View style={[styles.timeIndicator, { backgroundColor: statusColor }]}>
          <Text variant="labelLarge" style={{ color: '#FFF' }}>
            {time}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="titleMedium">{patientName}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {type}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
      </Card.Content>
    </Card>
  );
};

const PremiumFeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  tag: string;
}> = ({ icon, title, description, tag }) => {
  const theme = useTheme();
  return (
    <Card style={styles.premiumFeatureCard}>
      <Card.Content style={styles.premiumFeatureContent}>
        <View style={[styles.premiumIcon, { backgroundColor: theme.colors.primaryContainer }]}>
          <Icon name={icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.premiumFeatureHeader}>
            <Text variant="titleMedium">{title}</Text>
            <Chip mode="flat" compact style={{ backgroundColor: theme.colors.success }}>
              {tag}
            </Chip>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  premiumBanner: {
    padding: spacing.md,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  actionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  appointmentCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIndicator: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  premiumFeatureCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  premiumFeatureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumFeatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});

export default DashboardScreen;
