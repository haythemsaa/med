import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, TextInput, Button, Portal, Modal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';
import { usePatientFamilyHistory, useCreateFamilyHistory, useDeleteFamilyHistory } from '../../hooks/useFamilyHistory';

const FamilyHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const [patientId, setPatientId] = useState('');
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    relationship: 'PARENT',
    condition: '',
    ageAtDiagnosis: '',
    notes: '',
  });

  const { data: familyHistory, isLoading } = usePatientFamilyHistory(patientId);
  const createMutation = useCreateFamilyHistory();
  const deleteMutation = useDeleteFamilyHistory();

  const handleSubmit = () => {
    if (!patientId || !formData.condition) return;

    createMutation.mutate(
      {
        patientId,
        ...formData,
        ageAtDiagnosis: formData.ageAtDiagnosis ? parseInt(formData.ageAtDiagnosis) : undefined,
      },
      {
        onSuccess: () => {
          setVisible(false);
          setFormData({
            relationship: 'PARENT',
            condition: '',
            ageAtDiagnosis: '',
            notes: '',
          });
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Premium Banner */}
        <Card style={[styles.premiumCard, { backgroundColor: theme.colors.success }]}>
          <Card.Content>
            <View style={styles.premiumContent}>
              <Icon name="dna" size={40} color="#FFF" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: '600' }}>
                  Antécédents Familiaux
                </Text>
                <Text variant="bodySmall" style={{ color: '#FFF', opacity: 0.9 }}>
                  Arbre généalogique médical complet
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Patient Selection */}
        <View style={styles.section}>
          <TextInput
            label="ID Patient"
            value={patientId}
            onChangeText={setPatientId}
            mode="outlined"
            placeholder="Entrez l'ID du patient"
            left={<TextInput.Icon icon="account-search" />}
            style={styles.input}
          />
        </View>

        {/* Family History List */}
        {patientId && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Historique familial
            </Text>

            {isLoading ? (
              <Text>Chargement...</Text>
            ) : familyHistory && familyHistory.length > 0 ? (
              familyHistory.map((item: any) => (
                <Card key={item.id} style={styles.historyCard}>
                  <Card.Content>
                    <View style={styles.historyHeader}>
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium">{item.condition}</Text>
                        <View style={styles.chips}>
                          <Chip mode="outlined" compact>
                            {item.relationship}
                          </Chip>
                          {item.ageAtDiagnosis && (
                            <Chip mode="outlined" compact>
                              {item.ageAtDiagnosis} ans
                            </Chip>
                          )}
                        </View>
                      </View>
                      <Icon
                        name="delete"
                        size={24}
                        color={theme.colors.error}
                        onPress={() => deleteMutation.mutate(item.id)}
                      />
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Icon name="family-tree" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Aucun antécédent familial enregistré
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setVisible(true)}
        disabled={!patientId}
      />

      {/* Add Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Ajouter un antécédent
          </Text>

          <TextInput
            label="Pathologie"
            value={formData.condition}
            onChangeText={(text) => setFormData({ ...formData, condition: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Âge au diagnostic"
            value={formData.ageAtDiagnosis}
            onChangeText={(text) => setFormData({ ...formData, ageAtDiagnosis: text })}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 1 }}>
              Annuler
            </Button>
            <Button mode="contained" onPress={handleSubmit} style={{ flex: 1 }} disabled={!formData.condition}>
              Ajouter
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  premiumCard: {
    margin: spacing.md,
    borderRadius: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  emptyCard: {
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  fab: {
    position: 'absolute',
    margin: spacing.lg,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: 16,
  },
  modalTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

export default FamilyHistoryScreen;
