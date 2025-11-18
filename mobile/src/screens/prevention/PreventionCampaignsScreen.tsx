import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, useTheme, Chip, TextInput, Button, Portal, Modal, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../theme/theme';
import { useCabinetCampaigns, useCreateCampaign, useSendCampaign, useDeleteCampaign } from '../../hooks/usePreventionCampaigns';
import { useAuth } from '../../contexts/AuthContext';

const PreventionCampaignsScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campaignType: 'VACCINATION',
    message: '',
    targetCriteria: '',
  });

  const { data: campaigns, isLoading } = useCabinetCampaigns(cabinetId);
  const createMutation = useCreateCampaign();
  const sendMutation = useSendCampaign();
  const deleteMutation = useDeleteCampaign();

  const handleSubmit = () => {
    if (!cabinetId || !formData.name || !formData.message) return;

    createMutation.mutate(
      {
        cabinetId,
        ...formData,
        targetCriteria: formData.targetCriteria ? JSON.parse(formData.targetCriteria) : {},
      },
      {
        onSuccess: () => {
          setVisible(false);
          setFormData({
            name: '',
            campaignType: 'VACCINATION',
            message: '',
            targetCriteria: '',
          });
        },
      }
    );
  };

  const getCampaignColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return theme.colors.onSurfaceVariant;
      case 'SCHEDULED': return theme.colors.info;
      case 'SENDING': return theme.colors.warning;
      case 'SENT': return theme.colors.success;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Premium Banner */}
        <Card style={[styles.premiumCard, { backgroundColor: theme.colors.warning }]}>
          <Card.Content>
            <View style={styles.premiumContent}>
              <Icon name="bullhorn" size={40} color="#FFF" />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="titleLarge" style={{ color: '#FFF', fontWeight: '600' }}>
                  Campagnes de Prévention
                </Text>
                <Text variant="bodySmall" style={{ color: '#FFF', opacity: 0.9 }}>
                  Communication ciblée automatique
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Campaign Types */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            TYPES DE CAMPAGNES
          </Text>
          <View style={styles.typeGrid}>
            <Chip icon="needle" mode="outlined" compact>Vaccination</Chip>
            <Chip icon="test-tube" mode="outlined" compact>Dépistage</Chip>
            <Chip icon="heart-pulse" mode="outlined" compact>Suivi chronique</Chip>
            <Chip icon="shield-check" mode="outlined" compact>Prévention</Chip>
            <Chip icon="bell" mode="outlined" compact>Rappels</Chip>
          </View>
        </View>

        {/* Campaigns List */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Campagnes ({campaigns?.length || 0})
          </Text>

          {isLoading ? (
            <Text>Chargement...</Text>
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign: any) => (
              <Card key={campaign.id} style={styles.campaignCard}>
                <Card.Content>
                  <View style={styles.campaignHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{campaign.name}</Text>
                      <View style={styles.chips}>
                        <Chip mode="outlined" compact>{campaign.campaignType}</Chip>
                        <Chip
                          mode="flat"
                          compact
                          style={{ backgroundColor: `${getCampaignColor(campaign.status)}20` }}
                          textStyle={{ color: getCampaignColor(campaign.status) }}
                        >
                          {campaign.status}
                        </Chip>
                      </View>
                      <Text variant="bodySmall" style={{ marginTop: spacing.xs }}>
                        {campaign.message.substring(0, 80)}...
                      </Text>

                      {campaign.recipientCount > 0 && (
                        <View style={{ marginTop: spacing.sm }}>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {campaign.recipientCount} destinataires
                          </Text>
                          {campaign.status === 'SENDING' && (
                            <ProgressBar progress={0.6} style={{ marginTop: spacing.xs }} />
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.campaignActions}>
                    {campaign.status === 'DRAFT' && (
                      <>
                        <Button mode="outlined" compact onPress={() => {}} style={{ flex: 1 }}>
                          Planifier
                        </Button>
                        <Button
                          mode="contained"
                          compact
                          onPress={() => sendMutation.mutate(campaign.id)}
                          style={{ flex: 1 }}
                        >
                          Envoyer
                        </Button>
                      </>
                    )}
                    {campaign.status === 'SENT' && (
                      <Button mode="outlined" compact icon="chart-bar" style={{ flex: 1 }}>
                        Statistiques
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="bullhorn-outline" size={48} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Aucune campagne créée
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
            Nouvelle campagne
          </Text>

          <TextInput
            label="Nom de la campagne"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Message"
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Message envoyé par SMS/Email/Push..."
          />

          <TextInput
            label="Critères de ciblage (JSON)"
            value={formData.targetCriteria}
            onChangeText={(text) => setFormData({ ...formData, targetCriteria: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            placeholder='{"ageMin": 50, "ageMax": 75}'
          />

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 1 }}>
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={{ flex: 1 }}
              disabled={!formData.name || !formData.message}
            >
              Créer
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  campaignCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  campaignActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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

export default PreventionCampaignsScreen;
