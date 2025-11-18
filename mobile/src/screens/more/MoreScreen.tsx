import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Surface, useTheme, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../theme/theme';

const MoreScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      {/* User Profile */}
      <Surface style={[styles.profileSection, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.profileAvatar}>
          <Icon name="account-circle" size={80} color="#FFF" />
        </View>
        <Text variant="headlineSmall" style={{ color: '#FFF', fontWeight: '600' }}>
          Dr. {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={{ color: '#FFF', opacity: 0.9 }}>
          {user?.email}
        </Text>
      </Surface>

      {/* Premium Features Section */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          FONCTIONNALITÉS PREMIUM (GRATUITES)
        </Text>

        <List.Item
          title="Antécédents Familiaux"
          description="Arbre généalogique médical"
          left={(props) => <List.Icon {...props} icon="family-tree" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Allergies Avancées"
          description="6 types d'allergènes, tests, désensibilisation"
          left={(props) => <List.Icon {...props} icon="alert-decagram" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Carnet Professionnel"
          description="Contacts professionnels partagés"
          left={(props) => <List.Icon {...props} icon="contacts" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Campagnes de Prévention"
          description="Communication ciblée automatique"
          left={(props) => <List.Icon {...props} icon="bullhorn" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Réunions MSP/RCP"
          description="Coordination pluridisciplinaire"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Protocoles de Soins"
          description="Plans de soins partagés"
          left={(props) => <List.Icon {...props} icon="clipboard-list" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Agenda Avancé"
          description="Multi-sites illimité, 5 créneaux parallèles"
          left={(props) => <List.Icon {...props} icon="calendar-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
      </View>

      {/* General Section */}
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          GÉNÉRAL
        </Text>

        <List.Item
          title="Paramètres"
          left={(props) => <List.Icon {...props} icon="cog" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Statistiques"
          left={(props) => <List.Icon {...props} icon="chart-bar" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Documentation"
          left={(props) => <List.Icon {...props} icon="book-open-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="À propos"
          left={(props) => <List.Icon {...props} icon="information" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}
        />
        <Divider />

        <List.Item
          title="Déconnexion"
          titleStyle={{ color: theme.colors.error }}
          left={(props) => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
          onPress={logout}
        />
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          MediCare Mobile v1.0.0
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Meilleur que Doctolib - 100% GRATUIT
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  profileSection: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  profileAvatar: {
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.md,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    padding: spacing.md,
    color: '#757575',
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    padding: spacing.xl,
  },
});

export default MoreScreen;
