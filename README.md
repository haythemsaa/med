# MediCare SaaS - Plateforme HealthTech

## Vue d'ensemble

MediCare est une plateforme SaaS complète de gestion médicale multi-spécialités destinée aux cabinets médicaux, cliniques et centres paramédicaux en Tunisie et à l'international.

## Fonctionnalités Principales

### Phase 1 (Modules Inclus)
- ✅ **Module Super Admin** - Gestion des cabinets, abonnements, analytics
- ✅ **Module Cabinet/Clinique** - Dashboard, gestion praticiens, paramètres
- ✅ **Module Agenda & Rendez-vous** - Agenda multi-praticiens, prise RDV en ligne
- ✅ **Module Dossier Patient** - Fiche patient, historique, documents médicaux
- ✅ **Module Notifications** - SMS, Emails, Rappels automatiques
- ✅ **Portail Patient** - Consultation RDV, accès résultats, historique

### Phase 2 (À venir)
- 🔄 Module Téléconsultation (WebRTC)
- 🔄 Module WhatsApp Business
- 🔄 Module Facturation
- 🔄 Documents Spécialisés (DICOM, Laboratoire, Kinésithérapie)

## Architecture Technique

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT + bcrypt
- **Validation**: Zod
- **Architecture**: Multi-tenant, RESTful API

### Frontend
- **Framework**: React + TypeScript
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: React Context + React Query
- **Routing**: React Router
- **Forms**: React Hook Form + Zod

### Sécurité
- Chiffrement AES-256 (données au repos)
- TLS 1.3 (données en transit)
- RBAC (Role-Based Access Control)
- Hashage bcrypt (mots de passe)
- Protection RGPD

## Acteurs et Rôles

1. **Super Administrateur SaaS** - Gestion globale plateforme
2. **Administrateur Cabinet** - Gestion du cabinet
3. **Praticien** - Médecin, Spécialiste
4. **Secrétaire Médicale** - Gestion administrative
5. **Personnel Paramédical** - Kinésithérapeute, Nutritionniste, Psychologue
6. **Radiologue** - Imagerie médicale
7. **Laborantin** - Analyses médicales
8. **Patient** - Utilisateur final

## Installation

### Prérequis
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm ou yarn

### Installation Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Installation Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm start
```

## Configuration

### Variables d'Environnement Backend

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medicare"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"

# SMS (Twilio ou autre provider)
SMS_PROVIDER_API_KEY="your-api-key"
SMS_PROVIDER_API_SECRET="your-api-secret"

# Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key"
```

### Variables d'Environnement Frontend

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

## Structure du Projet

```
medicare-saas/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Contrôleurs
│   │   ├── middleware/      # Middlewares
│   │   ├── models/          # Modèles (si nécessaire)
│   │   ├── routes/          # Routes API
│   │   ├── services/        # Logique métier
│   │   ├── utils/           # Utilitaires
│   │   └── types/           # Types TypeScript
│   ├── prisma/
│   │   └── schema.prisma    # Schéma base de données
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   ├── hooks/           # Custom hooks
│   │   ├── contexts/        # Contexts React
│   │   ├── utils/           # Utilitaires
│   │   └── types/           # Types TypeScript
│   └── package.json
├── docs/                    # Documentation
└── README.md
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir token
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser mot de passe

### Cabinets
- `GET /api/cabinets` - Liste cabinets
- `POST /api/cabinets` - Créer cabinet
- `GET /api/cabinets/:id` - Détails cabinet
- `PUT /api/cabinets/:id` - Modifier cabinet
- `DELETE /api/cabinets/:id` - Supprimer cabinet

### Praticiens
- `GET /api/practitioners` - Liste praticiens
- `POST /api/practitioners` - Créer praticien
- `GET /api/practitioners/:id` - Détails praticien
- `PUT /api/practitioners/:id` - Modifier praticien
- `DELETE /api/practitioners/:id` - Supprimer praticien

### Patients
- `GET /api/patients` - Liste patients
- `POST /api/patients` - Créer patient
- `GET /api/patients/:id` - Détails patient
- `PUT /api/patients/:id` - Modifier patient
- `DELETE /api/patients/:id` - Supprimer patient

### Rendez-vous
- `GET /api/appointments` - Liste RDV
- `POST /api/appointments` - Créer RDV
- `GET /api/appointments/:id` - Détails RDV
- `PUT /api/appointments/:id` - Modifier RDV
- `DELETE /api/appointments/:id` - Annuler RDV
- `GET /api/appointments/available-slots` - Créneaux disponibles

### Dossiers Médicaux
- `GET /api/medical-records/:patientId` - Dossier patient
- `POST /api/medical-records` - Créer consultation
- `PUT /api/medical-records/:id` - Modifier consultation
- `POST /api/medical-records/documents` - Upload document

### Notifications
- `POST /api/notifications/send` - Envoyer notification
- `GET /api/notifications` - Liste notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu

## Règles de Gestion

### Mots de passe
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Hashage bcrypt (coût: 12)

### Rendez-vous
- Délai minimum: 2 heures (configurable)
- Délai maximum: 90 jours (configurable)
- No-show après 15 minutes de retard
- Blocage après 3 no-shows

### Formats
- Téléphones: Format international (+216 pour Tunisie)
- Dates: ISO 8601 (YYYY-MM-DD)
- Heures: Format 24h (HH:MM)

## Sécurité et RGPD

- Chiffrement AES-256 des données sensibles
- Authentification à deux facteurs (2FA)
- Logs d'audit complets
- Droits d'accès, rectification, suppression
- Export des données au format JSON/PDF
- Conservation des données selon réglementation

## Tests

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:coverage
```

## Déploiement

### Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Déployer le dossier build/
```

## Support

Pour toute question ou support, contactez l'équipe projet.

## Licence

© 2024 - Tous droits réservés

---

**Version**: 1.0
**Date**: Novembre 2024
**Marché cible**: Tunisie et International
