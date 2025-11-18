# MediCare Mobile 📱

Application mobile React Native pour MediCare - Plateforme médicale moderne et professionnelle.

## 🎯 Fonctionnalités

### ✅ Fonctionnalités de base
- 🔐 Authentification sécurisée
- 📊 Tableau de bord médical
- 👥 Gestion des patients
- 📅 Gestion des rendez-vous
- 🤖 Assistant IA pour consultations

### 🌟 Fonctionnalités Premium (100% GRATUITES)
Toutes les fonctionnalités premium de Doctolib (300€/mois) sont **gratuites** dans MediCare :

1. **Assistant IA Consultation** (79€/mois chez Doctolib)
   - Transcription automatique (OpenAI Whisper)
   - Résumés de consultation
   - Lettres médicales automatiques
   - Extraction de données cliniques

2. **Antécédents Familiaux**
   - Arbre généalogique médical complet
   - Suivi détaillé des pathologies familiales

3. **Gestion Avancée des Allergies**
   - 6 types d'allergènes (vs 3 chez Doctolib)
   - Tests cutanés et IgE spécifiques
   - Suivi de désensibilisation

4. **Carnet d'Adresses Professionnel**
   - Contacts partagés illimités
   - Numéros RPPS/ADELI/FINESS

5. **Campagnes de Prévention**
   - Communication ciblée automatique
   - Multi-canal (SMS, Email, Push)

6. **Réunions MSP/RCP**
   - Coordination pluridisciplinaire
   - Comptes-rendus automatiques

7. **Protocoles de Soins Partagés**
   - Plans de soins collaboratifs
   - Validation multi-praticiens

8. **Agenda Avancé**
   - Lieux d'exercice illimités (vs 2 chez Doctolib)
   - 5 créneaux parallèles (vs 2 chez Doctolib)
   - Alertes retard automatiques

9. **Messagerie Patients Sans Compte**
   - Liens sécurisés 14 jours
   - Aucune inscription requise

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI
- Un émulateur iOS/Android ou l'app Expo Go

### Démarrage rapide

```bash
# Installer les dépendances
cd mobile
npm install

# Lancer l'application
npm start

# Ou pour une plateforme spécifique
npm run android  # Android
npm run ios      # iOS
```

## 🎨 Design System

### Thème Médical Moderne
- **Couleurs primaires** : Bleu médical apaisant (#1976D2)
- **Couleurs secondaires** : Vert santé (#4CAF50)
- **Accent** : Bleu clair moderne (#00BCD4)
- **Typographie** : Material Design 3
- **Coins arrondis** : 12px (moderne et doux)

### Couleurs spécifiques au médical
- 🚨 Urgence : Rouge (#D32F2F)
- 💊 Ordonnance : Violet (#7B1FA2)
- 🔬 Laboratoire : Cyan (#0097A7)
- 💉 Vaccination : Vert (#388E3C)

## 📱 Stack Technique

### Frontend
- **React Native** 0.73
- **Expo** ~50.0
- **React Navigation** v6
- **React Native Paper** (Material Design)
- **TypeScript**

### State Management
- **React Query** (@tanstack/query)
- **Context API** (Auth)

### Storage
- **Expo Secure Store** (tokens)
- **AsyncStorage** (preferences)

### API
- **Axios** avec interceptors
- **Auto-retry** sur erreurs réseau
- **JWT Authentication**

## 📁 Structure du projet

```
mobile/
├── src/
│   ├── screens/           # Écrans de l'app
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Tableau de bord
│   │   ├── patients/     # Gestion patients
│   │   ├── appointments/ # Rendez-vous
│   │   ├── ai-assistant/ # Assistant IA
│   │   └── more/         # Menu Plus
│   ├── navigation/       # Configuration navigation
│   ├── components/       # Composants réutilisables
│   ├── contexts/         # Contexts React (Auth, etc.)
│   ├── hooks/            # Custom hooks
│   ├── services/         # Services API
│   ├── theme/            # Thème et couleurs
│   ├── config/           # Configuration
│   └── utils/            # Utilitaires
├── assets/               # Images, fonts
├── App.tsx              # Point d'entrée
└── package.json
```

## 🔐 Configuration API

Modifier `src/config/api.ts` pour pointer vers votre backend :

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v4'      // Development
  : 'https://your-api.com/api/v4';      // Production
```

## 💰 Comparaison vs Doctolib

| Fonctionnalité | Doctolib | MediCare Mobile |
|----------------|----------|-----------------|
| **Prix mensuel** | 135-149€ | **GRATUIT** |
| **Assistant IA** | +79€/mois | **GRATUIT** |
| **Total annuel** | ~3,684€ | **0€** |
| **Lieux d'exercice** | 2 max | **Illimité** |
| **Créneaux parallèles** | 2 | **5** |
| **Types allergènes** | 3 | **6** |

**ÉCONOMIE : 3,684€/an par praticien**

## 📄 Licence

Propriétaire - MediCare SaaS Platform

## 🤝 Support

Pour toute question ou assistance :
- Email: support@medicare.com
- Documentation: https://docs.medicare.com

---

**Fait avec ❤️ pour les professionnels de santé**
