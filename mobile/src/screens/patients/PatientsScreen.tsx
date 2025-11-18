import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Searchbar, FAB, useTheme, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';

const PatientsScreen: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const mockPatients = [
    { id: '1', name: 'Marie Dupont', age: 45, lastVisit: '15/11/2024', status: 'active' },
    { id: '2', name: 'Jean Martin', age: 62, lastVisit: '10/11/2024', status: 'chronic' },
    { id: '3', name: 'Sophie Bernard', age: 28, lastVisit: '18/11/2024', status: 'new' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un patient..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          icon="magnify"
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={mockPatients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.patientCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Icon name="account" size={32} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.age} ans • Dernière visite: {item.lastVisit}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  compact
                  style={{
                    backgroundColor:
                      item.status === 'new'
                        ? theme.colors.success
                        : item.status === 'chronic'
                        ? theme.colors.warning
                        : theme.colors.primaryContainer,
                  }}
                >
                  {item.status === 'new' ? 'Nouveau' : item.status === 'chronic' ? 'Chronique' : 'Actif'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => console.log('Add patient')}
        label="Nouveau patient"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchbar: {
    elevation: 2,
  },
  list: {
    padding: spacing.md,
  },
  patientCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
});

export default PatientsScreen;
