# 🚀 MediCare SaaS - Démarrage Rapide

Guide de démarrage rapide pour lancer l'application en 5 minutes.

## Installation Express

```bash
# 1. Cloner le projet
git clone https://github.com/haythemsaa/med.git
cd med

# 2. Installer les dépendances
./scripts/setup.sh

# 3. Configurer la base de données
# Éditez backend/.env et configurez DATABASE_URL
nano backend/.env

# 4. Créer la base de données
cd backend
npx prisma migrate dev --name init

# 5. Lancer l'application
cd ..
./scripts/start-dev.sh
```

## Accès

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api/v1

## Premier Connexion

Utilisez les credentials par défaut:
- Email: `admin@medicare.tn`
- Password: `Admin123!`

⚠️ **Changez le mot de passe immédiatement!**

## Structure du Projet

```
medicare-saas/
├── backend/           # API Node.js + Express + Prisma
├── frontend/          # React + Material-UI
├── docs/              # Documentation
└── scripts/           # Scripts utilitaires
```

## Commandes Utiles

### Backend

```bash
cd backend

# Démarrer en dev
npm run dev

# Générer client Prisma
npx prisma generate

# Créer migration
npx prisma migrate dev

# Studio Prisma
npx prisma studio

# Build production
npm run build
npm start
```

### Frontend

```bash
cd frontend

# Démarrer
npm start

# Build
npm run build

# Tests
npm test
```

## Documentation Complète

📖 Consultez [INSTALLATION.md](./docs/INSTALLATION.md) pour le guide complet.

## Support

- Email: support@medicare.tn
- GitHub: https://github.com/haythemsaa/med

---

**Version**: 1.0.0
**Dernière mise à jour**: Novembre 2024
