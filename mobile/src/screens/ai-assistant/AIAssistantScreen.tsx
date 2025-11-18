import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Surface, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';

const AIAssistantScreen: React.FC = () => {
  const theme = useTheme();
  const [recording, setRecording] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Premium Header */}
      <Surface style={[styles.premiumHeader, { backgroundColor: theme.colors.success }]}>
        <View style={styles.premiumContent}>
          <Icon name="star" size={40} color="#FFF" />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text variant="headlineSmall" style={{ color: '#FFF', fontWeight: '600' }}>
              Assistant IA Premium
            </Text>
            <Text variant="bodyMedium" style={{ color: '#FFF', opacity: 0.9 }}>
              79€/mois chez Doctolib - ICI GRATUIT!
            </Text>
          </View>
        </View>
      </Surface>

      {/* Recording Controls */}
      <Card style={styles.recordingCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Enregistrer une consultation
          </Text>

          <View style={styles.recordingControls}>
            <View
              style={[
                styles.micButton,
                {
                  backgroundColor: recording ? theme.colors.error : theme.colors.primary,
                },
              ]}
            >
              <Icon name={recording ? 'stop' : 'microphone'} size={48} color="#FFF" />
            </View>

            <Button
              mode="contained"
              onPress={() => setRecording(!recording)}
              style={styles.recordButton}
              buttonColor={recording ? theme.colors.error : theme.colors.primary}
            >
              {recording ? 'Arrêter' : 'Démarrer'} l'enregistrement
            </Button>

            {recording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text variant="bodyMedium">Enregistrement en cours...</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Icon name="file-document" size={32} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              24
            </Text>
            <Text variant="bodySmall">Enregistrements</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Card.Content>
            <Icon name="clock-fast" size={32} color={theme.colors.success} />
            <Text variant="headlineMedium" style={{ color: theme.colors.success }}>
              2.5h
            </Text>
            <Text variant="bodySmall">Temps économisé</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content>
            <Icon name="chart-line" size={32} color={theme.colors.warning} />
            <Text variant="headlineMedium" style={{ color: theme.colors.warning }}>
              98%
            </Text>
            <Text variant="bodySmall">Précision</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Features */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Fonctionnalités IA
      </Text>

      <FeatureCard
        icon="text-recognition"
        title="Transcription automatique"
        description="Conversion audio → texte avec OpenAI Whisper"
        color={theme.colors.primary}
      />

      <FeatureCard
        icon="file-document-edit"
        title="Résumé de consultation"
        description="Génération automatique du résumé médical"
        color={theme.colors.success}
      />

      <FeatureCard
        icon="email-edit"
        title="Lettre médicale"
        description="Rédaction automatique des courriers médicaux"
        color={theme.colors.tertiary}
      />

      <FeatureCard
        icon="database-export"
        title="Extraction de données"
        description="Antécédents, allergies, diagnostics extraits automatiquement"
        color={theme.colors.prescription}
      />

      {/* Recent Recordings */}
      <Text variant="titleLarge" style={styles.sectionTitle}>
        Enregistrements récents
      </Text>

      <RecordingItem
        date="18/11/2024 14:30"
        patient="Marie Dupont"
        duration="12:45"
        status="processed"
      />
      <RecordingItem
        date="18/11/2024 10:15"
        patient="Jean Martin"
        duration="8:20"
        status="processed"
      />
      <RecordingItem
        date="17/11/2024 16:00"
        patient="Sophie Bernard"
        duration="15:30"
        status="processing"
      />

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <Card style={styles.featureCard}>
    <Card.Content style={styles.featureContent}>
      <View style={[styles.featureIcon, { backgroundColor: `${color}15` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="titleMedium">{title}</Text>
        <Text variant="bodySmall" style={{ color: '#616161', marginTop: spacing.xs }}>
          {description}
        </Text>
      </View>
    </Card.Content>
  </Card>
);

const RecordingItem: React.FC<{
  date: string;
  patient: string;
  duration: string;
  status: string;
}> = ({ date, patient, duration, status }) => {
  const theme = useTheme();
  return (
    <Card style={styles.recordingItem}>
      <Card.Content style={styles.recordingContent}>
        <Icon
          name="microphone"
          size={24}
          color={status === 'processed' ? theme.colors.success : theme.colors.warning}
        />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text variant="titleSmall">{patient}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {date} • {duration}
          </Text>
        </View>
        <Chip
          mode="flat"
          compact
          style={{
            backgroundColor:
              status === 'processed'
                ? theme.colors.successContainer || '#E8F5E9'
                : theme.colors.warningContainer || '#FFF3E0',
          }}
        >
          {status === 'processed' ? 'Traité' : 'En cours'}
        </Chip>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  premiumHeader: {
    padding: spacing.lg,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingCard: {
    margin: spacing.md,
    borderRadius: 16,
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  recordingControls: {
    alignItems: 'center',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordButton: {
    marginTop: spacing.md,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    padding: spacing.md,
    fontWeight: '600',
  },
  featureCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AIAssistantScreen;
