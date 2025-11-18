import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, TextInput, Button, Portal, Modal, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';
import { usePatientAllergies, useCreateAllergy, useDeleteAllergy } from '../../hooks/useAllergyDetails';

const AllergiesScreen: React.FC = () => {
  const theme = useTheme();
  const [patientId, setPatientId] = useState('');
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    allergenType: 'MEDICATION',
    allergenName: '',
    severity: 'MODERATE',
    reactions: '',
  });

  const { data: allergies } = usePatientAllergies(patientId);
  const createMutation = useCreateAllergy();
  const deleteMutation = useDeleteAllergy();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'MILD': return theme.colors.success;
      case 'MODERATE': return theme.colors.warning;
      case 'SEVERE': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const handleSubmit = () => {
    if (!patientId || !formData.allergenName) return;

    createMutation.mutate(
      {
        patientId,
        ...formData,
        reactions: formData.reactions.split(',').map((r) => r.trim()),
      },
      {
        onSuccess: () => {
          setVisible(false);
          setFormData({
            allergenType: 'MEDICATION',
            allergenName: '',
            severity: 'MODERATE',
            reactions: '',
          });
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Premium Banner */}
        <Card style={[styles.premiumCard, { backgroundColor: theme.colors.warning }]}>
          <Card.Content>
            <View style={styles.premiumContent}>
              <Icon name="alert-decagram" size={40} color="#FFF" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: '600' }}>
                  Allergies Avancées
                </Text>
                <Text variant="bodySmall" style={{ color: '#FFF', opacity: 0.9 }}>
                  6 types vs 3 chez Doctolib
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

        {/* Allergen Types */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            TYPES D'ALLERGÈNES SUPPORTÉS
          </Text>
          <View style={styles.typeGrid}>
            <Chip icon="pill" mode="outlined" compact>Médicaments</Chip>
            <Chip icon="food-apple" mode="outlined" compact>Aliments</Chip>
            <Chip icon="tree" mode="outlined" compact>Environnement</Chip>
            <Chip icon="bee" mode="outlined" compact>Venins</Chip>
            <Chip icon="hand-wash" mode="outlined" compact>Latex</Chip>
            <Chip icon="help-circle" mode="outlined" compact>Autres</Chip>
          </View>
        </View>

        {/* Allergies List */}
        {patientId && allergies && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Allergies ({allergies.length})
            </Text>

            {allergies.map((allergy: any) => (
              <Card key={allergy.id} style={styles.allergyCard}>
                <Card.Content>
                  <View style={styles.allergyHeader}>
                    <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(allergy.severity) }]} />
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{allergy.allergenName}</Text>
                      <View style={styles.chips}>
                        <Chip mode="outlined" compact>{allergy.allergenType}</Chip>
                        <Chip
                          mode="flat"
                          compact
                          style={{ backgroundColor: `${getSeverityColor(allergy.severity)}20` }}
                          textStyle={{ color: getSeverityColor(allergy.severity) }}
                        >
                          {allergy.severity}
                        </Chip>
                      </View>
                    </View>
                    <Icon
                      name="delete"
                      size={24}
                      color={theme.colors.error}
                      onPress={() => deleteMutation.mutate(allergy.id)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))}
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
            Ajouter une allergie
          </Text>

          <Text variant="labelMedium" style={styles.inputLabel}>Sévérité</Text>
          <SegmentedButtons
            value={formData.severity}
            onValueChange={(value) => setFormData({ ...formData, severity: value })}
            buttons={[
              { value: 'MILD', label: 'Légère' },
              { value: 'MODERATE', label: 'Modérée' },
              { value: 'SEVERE', label: 'Sévère' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            label="Nom de l'allergène"
            value={formData.allergenName}
            onChangeText={(text) => setFormData({ ...formData, allergenName: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Réactions (séparées par virgule)"
            value={formData.reactions}
            onChangeText={(text) => setFormData({ ...formData, reactions: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            placeholder="Ex: urticaire, œdème, dyspnée"
          />

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 1 }}>
              Annuler
            </Button>
            <Button mode="contained" onPress={handleSubmit} style={{ flex: 1 }} disabled={!formData.allergenName}>
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
  inputLabel: {
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  allergyCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  severityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
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

export default AllergiesScreen;
