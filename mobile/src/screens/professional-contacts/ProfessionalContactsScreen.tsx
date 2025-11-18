import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, TextInput, Button, Portal, Modal, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';
import { useCabinetContacts, useCreateContact, useDeleteContact } from '../../hooks/useProfessionalContacts';
import { useAuth } from '../../contexts/AuthContext';

const ProfessionalContactsScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    contactType: 'DOCTOR',
    firstName: '',
    lastName: '',
    specialty: '',
    phone: '',
    email: '',
    rppsNumber: '',
  });

  const { data: contacts, isLoading } = useCabinetContacts(cabinetId);
  const createMutation = useCreateContact();
  const deleteMutation = useDeleteContact();

  const handleSubmit = () => {
    if (!cabinetId || !formData.firstName || !formData.lastName) return;

    createMutation.mutate(
      {
        cabinetId,
        ...formData,
      },
      {
        onSuccess: () => {
          setVisible(false);
          setFormData({
            contactType: 'DOCTOR',
            firstName: '',
            lastName: '',
            specialty: '',
            phone: '',
            email: '',
            rppsNumber: '',
          });
        },
      }
    );
  };

  const getContactIcon = (type: string) => {
    const icons: Record<string, string> = {
      DOCTOR: 'doctor',
      NURSE: 'medical-bag',
      PHARMACIST: 'pharmacy',
      HOSPITAL: 'hospital-building',
      LAB: 'flask',
      SPECIALIST: 'stethoscope',
    };
    return icons[type] || 'account';
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Premium Banner */}
        <Card style={[styles.premiumCard, { backgroundColor: theme.colors.tertiary }]}>
          <Card.Content>
            <View style={styles.premiumContent}>
              <Icon name="contacts" size={40} color="#FFF" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: '600' }}>
                  Carnet Professionnel
                </Text>
                <Text variant="bodySmall" style={{ color: '#FFF', opacity: 0.9 }}>
                  Partagé & Illimité vs Limité Doctolib
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <Icon name="account-multiple" size={28} color={theme.colors.primary} />
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {contacts?.length || 0}
              </Text>
              <Text variant="bodySmall">Contacts</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Card.Content style={styles.statContent}>
              <Icon name="share-variant" size={28} color={theme.colors.success} />
              <Text variant="headlineSmall" style={{ color: theme.colors.success }}>
                {contacts?.filter((c: any) => c.isShared).length || 0}
              </Text>
              <Text variant="bodySmall">Partagés</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Contacts List */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Contacts professionnels
          </Text>

          {isLoading ? (
            <Text>Chargement...</Text>
          ) : contacts && contacts.length > 0 ? (
            contacts.map((contact: any) => (
              <Card key={contact.id} style={styles.contactCard}>
                <Card.Content>
                  <View style={styles.contactHeader}>
                    <Avatar.Icon
                      size={48}
                      icon={getContactIcon(contact.contactType)}
                      style={{ backgroundColor: theme.colors.primaryContainer }}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.md }}>
                      <Text variant="titleMedium">
                        {contact.firstName} {contact.lastName}
                      </Text>
                      <View style={styles.chips}>
                        <Chip mode="outlined" compact>
                          {contact.contactType}
                        </Chip>
                        {contact.specialty && (
                          <Chip mode="outlined" compact>
                            {contact.specialty}
                          </Chip>
                        )}
                        {contact.isShared && (
                          <Chip mode="flat" compact style={{ backgroundColor: theme.colors.success }}>
                            Partagé
                          </Chip>
                        )}
                      </View>
                      {contact.phone && (
                        <View style={styles.contactInfo}>
                          <Icon name="phone" size={16} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={{ marginLeft: spacing.xs }}>
                            {contact.phone}
                          </Text>
                        </View>
                      )}
                      {contact.rppsNumber && (
                        <View style={styles.contactInfo}>
                          <Icon name="card-account-details" size={16} color={theme.colors.onSurfaceVariant} />
                          <Text variant="bodySmall" style={{ marginLeft: spacing.xs }}>
                            RPPS: {contact.rppsNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Icon
                      name="delete"
                      size={24}
                      color={theme.colors.error}
                      onPress={() => deleteMutation.mutate(contact.id)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="contacts" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Aucun contact professionnel
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setVisible(true)}
      />

      {/* Add Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Nouveau contact
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextInput
              label="Prénom"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              label="Nom"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              mode="outlined"
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <TextInput
            label="Spécialité"
            value={formData.specialty}
            onChangeText={(text) => setFormData({ ...formData, specialty: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Téléphone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Numéro RPPS"
            value={formData.rppsNumber}
            onChangeText={(text) => setFormData({ ...formData, rppsNumber: text })}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 1 }}>
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{ flex: 1 }}
              disabled={!formData.firstName || !formData.lastName}
            >
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
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  contactCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    maxHeight: '90%',
  },
  modalTitle: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});

export default ProfessionalContactsScreen;
