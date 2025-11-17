# MediCare SaaS - Installation Guide

Guide complet d'installation de la plateforme MediCare SaaS.

## Prérequis

### Logiciels requis

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14.x ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

### Vérification des prérequis

```bash
node -v    # Doit afficher v18.x ou supérieur
npm -v     # Doit afficher une version
psql --version  # Doit afficher PostgreSQL 14.x ou supérieur
```

## Installation

### Option 1: Installation automatique (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/haythemsaa/med.git
cd med

# 2. Rendre le script exécutable
chmod +x scripts/setup.sh

# 3. Exécuter le script de setup
./scripts/setup.sh
```

### Option 2: Installation manuelle

#### 1. Configuration de la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE medicare;

# Créer un utilisateur (optionnel)
CREATE USER medicare_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE medicare TO medicare_user;

# Quitter
\q
```

#### 2. Installation Backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer le fichier .env et configurer DATABASE_URL
nano .env

# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# (Optionnel) Remplir la base avec des données de test
npx prisma db seed
```

#### 3. Installation Frontend

```bash
# Aller dans le dossier frontend
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# (Optionnel) Éditer la configuration API
nano .env
```

## Configuration

### Variables d'environnement Backend

Éditez `backend/.env`:

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/medicare"

# JWT Secrets (⚠️ CHANGEZ CES VALEURS EN PRODUCTION!)
JWT_SECRET="votre-cle-secrete-tres-longue-et-aleatoire"
JWT_REFRESH_SECRET="votre-cle-refresh-tres-longue-et-aleatoire"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-app-password"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="votre-account-sid"
TWILIO_AUTH_TOKEN="votre-auth-token"
TWILIO_PHONE_NUMBER="+21612345678"

# Encryption (⚠️ CHANGEZ EN PRODUCTION!)
ENCRYPTION_KEY="votre-cle-32-caracteres-exacte"
```

### Variables d'environnement Frontend

Éditez `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_WS_URL=http://localhost:5000
```

## Démarrage

### Développement

#### Méthode 1: Script automatique

```bash
# Depuis la racine du projet
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

#### Méthode 2: Démarrage manuel

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Production

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
# Servir le dossier build/ avec nginx ou autre serveur web
```

## Accès à l'application

Une fois démarré:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/v1/health
- **Prisma Studio**: Exécutez `npx prisma studio` dans le dossier backend

## Compte Super Admin par défaut

Pour créer un compte super admin initial:

```bash
cd backend
npx ts-node src/scripts/create-admin.ts
```

Ou utilisez ces credentials de test:
- **Email**: admin@medicare.tn
- **Password**: Admin123!

⚠️ **CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT EN PRODUCTION!**

## Vérification de l'installation

### 1. Backend

```bash
curl http://localhost:5000/api/v1/health
```

Devrait retourner:
```json
{
  "success": true,
  "message": "MediCare API is running",
  "timestamp": "..."
}
```

### 2. Frontend

Ouvrez http://localhost:3000 dans votre navigateur. Vous devriez voir la page de connexion.

### 3. Base de données

```bash
cd backend
npx prisma studio
```

Ouvre une interface web pour visualiser vos données.

## Dépannage

### Erreur: "Cannot connect to database"

1. Vérifiez que PostgreSQL est en cours d'exécution:
   ```bash
   # Linux/Mac
   sudo service postgresql status

   # Windows
   # Vérifiez dans les services Windows
   ```

2. Vérifiez la chaîne de connexion dans `.env`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

3. Testez la connexion manuellement:
   ```bash
   psql -h localhost -U postgres -d medicare
   ```

### Erreur: "Port 5000 already in use"

Changez le port dans `backend/.env`:
```env
PORT=5001
```

Et mettez à jour `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api/v1
```

### Erreur: "Module not found"

Réinstallez les dépendances:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Erreur Prisma: "Migration failed"

Réinitialisez la base de données:
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

## Migration des données

Si vous avez déjà une base de données existante:

```bash
cd backend

# Générer une migration à partir du schéma
npx prisma migrate dev --name migration_name

# Ou pousser le schéma directement (dev uniquement)
npx prisma db push
```

## Tests

### Backend

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

## Prochaines étapes

1. ✅ Installez l'application
2. 📝 Lisez la [Documentation API](./API.md)
3. 🎨 Consultez le [Guide de Design](./DESIGN.md)
4. 🔐 Configurez la [Sécurité](./SECURITY.md)
5. 🚀 Déployez en [Production](./DEPLOYMENT.md)

## Support

Pour toute question:
- 📧 Email: support@medicare.tn
- 📖 Documentation: [docs.medicare.tn](https://docs.medicare.tn)
- 🐛 Issues: [GitHub Issues](https://github.com/haythemsaa/med/issues)
