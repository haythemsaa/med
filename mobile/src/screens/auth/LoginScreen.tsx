import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Icon name="hospital-box" size={60} color={theme.colors.onPrimary} />
          </View>
          <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
            MediCare
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Plateforme médicale moderne
          </Text>
        </View>

        {/* Login Form */}
        <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            Connexion
          </Text>

          {error ? (
            <Surface
              style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}
            >
              <Icon name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={{ color: theme.colors.error, marginLeft: spacing.sm }}>
                {error}
              </Text>
            </Surface>
          ) : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Se connecter
          </Button>

          <Button
            mode="text"
            onPress={() => {}}
            style={styles.forgotButton}
            textColor={theme.colors.primary}
          >
            Mot de passe oublié ?
          </Button>
        </Surface>

        {/* Features Highlight */}
        <View style={styles.featuresContainer}>
          <Text
            variant="titleMedium"
            style={[styles.featuresTitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Fonctionnalités Premium GRATUITES
          </Text>
          <View style={styles.featuresList}>
            <FeatureItem icon="robot" text="Assistant IA (79€/mois chez Doctolib)" />
            <FeatureItem icon="dna" text="Antécédents familiaux détaillés" />
            <FeatureItem icon="alert-decagram" text="Gestion avancée des allergies" />
            <FeatureItem icon="calendar-multiple" text="Agenda multi-sites illimité" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => {
  const theme = useTheme();
  return (
    <View style={styles.featureItem}>
      <Icon name={icon} size={20} color={theme.colors.success} />
      <Text variant="bodyMedium" style={styles.featureText}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  formContainer: {
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
  },
  formTitle: {
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  featuresContainer: {
    marginTop: spacing.xl,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
  },
});

export default LoginScreen;
