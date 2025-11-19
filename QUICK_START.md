# 🚀 MediCare - Guide de Démarrage Rapide

## ⚡ Démarrage en 1 Commande (Docker)

### Prérequis
- Docker Desktop installé ([Télécharger](https://www.docker.com/products/docker-desktop))
- 4 GB RAM minimum
- 10 GB espace disque

### Linux / macOS
```bash
./start.sh
```

### Windows
```bash
start.bat
```

**C'est tout !** L'application se lance automatiquement avec :
- ✅ Base de données PostgreSQL
- ✅ Backend API (Node.js)
- ✅ Frontend Web (React)
- ✅ Adminer (interface DB)
- ✅ Données de démonstration

---

## 🌐 Accès aux Applications

Une fois démarré, ouvrez votre navigateur :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Web** | http://localhost:3001 | Interface utilisateur principale |
| **Backend API** | http://localhost:3000 | API REST |
| **API Documentation** | http://localhost:3000/api/v4/docs | Documentation interactive |
| **Adminer** | http://localhost:8080 | Gestion base de données |

---

## 👤 Compte de Démonstration

```
Email:    demo@medicare.com
Password: demo123
Rôle:     Praticien (accès complet)
```

**Autres comptes de test :**
```
Admin Cabinet:
Email:    admin@medicare.com
Password: admin123

Secrétaire:
Email:    secretaire@medicare.com
Password: secretaire123

Patient:
Email:    patient@medicare.com
Password: patient123
```

---

## 📱 Application Mobile

### Démarrage Mobile (Expo)

```bash
cd mobile
npm install
npm start
```

**Scanner le QR code avec :**
- iOS: Camera app → QR code
- Android: Expo Go app → Scan QR code

**Télécharger Expo Go :**
- [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
- [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🛠️ Commandes Utiles

### Docker Compose

```bash
# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter tous les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Voir l'état des services
docker-compose ps

# Reconstruire les images
docker-compose build

# Nettoyer tout (⚠️ supprime les données)
docker-compose down -v
```

### Accès au Backend

```bash
# Entrer dans le conteneur backend
docker-compose exec backend sh

# Exécuter les migrations Prisma
docker-compose exec backend npx prisma migrate dev

# Générer le client Prisma
docker-compose exec backend npx prisma generate

# Voir la base de données
docker-compose exec backend npx prisma studio
```

### Accès à la Database

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U medicare -d medicare_db

# Backup de la base
docker-compose exec postgres pg_dump -U medicare medicare_db > backup.sql

# Restaurer un backup
docker-compose exec -T postgres psql -U medicare -d medicare_db < backup.sql
```

---

## 🧪 Données de Démonstration

L'application est pré-remplie avec des données réalistes :

### Cabinets Médicaux
- **Cabinet Médical Paris 15** (3 praticiens)
- **Centre de Santé Lyon** (2 praticiens)

### Patients (50+)
- Données médicales complètes
- Antécédents, allergies, consultations
- Rendez-vous planifiés

### Praticiens
- Profils complets avec spécialités
- Agendas pré-configurés
- Consultations historiques

### Fonctionnalités Pré-configurées
- ✅ 10+ enregistrements AI consultations
- ✅ 20+ antécédents familiaux
- ✅ 15+ allergies enregistrées
- ✅ 30+ contacts professionnels
- ✅ 5+ campagnes de prévention
- ✅ 8+ réunions MSP planifiées
- ✅ 6+ protocoles de soins actifs

---

## 🔧 Développement Manuel (sans Docker)

### 1. Base de Données

```bash
# Installer PostgreSQL
# Linux: sudo apt install postgresql
# macOS: brew install postgresql
# Windows: https://www.postgresql.org/download/windows/

# Créer la base
createdb medicare_db

# Ou avec psql
psql -U postgres
CREATE DATABASE medicare_db;
```

### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env
# Éditer .env avec vos paramètres

# Générer Prisma Client
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Seed avec données de démo
npx prisma db seed

# Démarrer le serveur
npm run dev
```

Backend disponible sur http://localhost:3000

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env

# Démarrer l'application
npm start
```

Frontend disponible sur http://localhost:3001

### 4. Mobile

```bash
cd mobile

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env

# Démarrer Expo
npm start
```

Scanner le QR code avec Expo Go

---

## 📊 Vérification de l'Installation

### Backend API Health Check

```bash
curl http://localhost:3000/api/v4/health
```

**Réponse attendue :**
```json
{
  "status": "healthy",
  "version": "4.0.0",
  "features": [
    "AI Consultation Assistant",
    "Family History",
    "Advanced Allergies",
    ...
  ]
}
```

### Frontend

Ouvrir http://localhost:3001 → Page de login

### Database

```bash
docker-compose exec postgres psql -U medicare -d medicare_db -c "\dt"
```

Devrait lister toutes les tables Prisma

---

## 🐛 Dépannage

### Port déjà utilisé

**Erreur:** `Port 3000 is already in use`

**Solution:**
```bash
# Trouver le processus
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou changer le port dans .env
PORT=3001
```

### Problèmes de connexion Database

**Erreur:** `Can't reach database server`

**Solution:**
```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier les logs
docker-compose logs postgres
```

### Erreur Prisma Client

**Erreur:** `Prisma Client is not generated`

**Solution:**
```bash
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### Frontend ne charge pas

**Erreur:** `Failed to fetch`

**Solution:**
```bash
# Vérifier que le backend tourne
curl http://localhost:3000/api/v4/health

# Vérifier REACT_APP_API_URL dans frontend/.env
# Doit être: http://localhost:3000/api/v4

# Redémarrer le frontend
docker-compose restart frontend
```

### Mobile ne se connecte pas

**Erreur:** `Network request failed`

**Solution:**
```bash
# Utiliser l'IP locale au lieu de localhost
# Dans mobile/src/config/api.ts:
# Remplacer localhost par votre IP (ex: 192.168.1.10)

# Trouver votre IP:
ipconfig  # Windows
ifconfig  # macOS/Linux
```

---

## 🎯 Fonctionnalités à Tester

### 1. Dashboard
- ✅ Vue d'ensemble avec statistiques
- ✅ Rendez-vous du jour
- ✅ Actions rapides

### 2. Gestion Patients
- ✅ Créer un nouveau patient
- ✅ Rechercher un patient
- ✅ Voir le dossier médical complet

### 3. Agenda
- ✅ Créer un rendez-vous
- ✅ Vues jour/semaine/mois
- ✅ Drag & drop des créneaux

### 4. AI Assistant (Premium)
- ✅ Enregistrer une consultation
- ✅ Transcription automatique
- ✅ Génération résumé médical
- ✅ Création lettre médicale

### 5. Antécédents Familiaux (Premium)
- ✅ Ajouter maladie familiale
- ✅ Visualiser arbre généalogique
- ✅ Résumé des risques

### 6. Allergies Avancées (Premium)
- ✅ 6 types d'allergènes
- ✅ Tests cutanés
- ✅ Protocoles désensibilisation

### 7. Carnet Professionnel (Premium)
- ✅ Ajouter contacts illimités
- ✅ Partage entre confrères
- ✅ RPPS/ADELI/FINESS

### 8. Campagnes Prévention (Premium)
- ✅ Créer campagne vaccination
- ✅ Ciblage automatique
- ✅ Envoi multi-canal

### 9. Réunions MSP/RCP (Premium)
- ✅ Planifier réunion
- ✅ Inviter participants
- ✅ Compte-rendu automatique

---

## 📚 Documentation Complète

- **Backend**: [/backend/DOCTOLIB_SURPASSED.md](/backend/DOCTOLIB_SURPASSED.md)
- **Frontend**: [/frontend/README.md](/frontend/README.md)
- **Mobile**: [/mobile/README.md](/mobile/README.md)
- **Features**: [/mobile/FEATURES.md](/mobile/FEATURES.md)
- **Projet**: [/PROJECT_COMPLETE.md](/PROJECT_COMPLETE.md)
- **Résumé**: [/FINAL_SUMMARY.md](/FINAL_SUMMARY.md)

---

## 💡 Astuces

### Adminer (Database UI)

**URL:** http://localhost:8080

**Connexion:**
```
System:   PostgreSQL
Server:   postgres
Username: medicare
Password: medicare_dev_password
Database: medicare_db
```

### Prisma Studio

```bash
docker-compose exec backend npx prisma studio
```

Interface graphique sur http://localhost:5555

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Avec filtrage
docker-compose logs -f | grep ERROR
```

### Reset complet

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Redémarrer
./start.sh  # ou start.bat sur Windows
```

---

## 🎉 Vous êtes prêt !

MediCare est maintenant opérationnel. Vous avez accès à :

- ✅ Backend API complet avec 9 features premium
- ✅ Frontend web moderne et responsive
- ✅ Application mobile native (iOS/Android)
- ✅ Base de données avec données de démo
- ✅ Interface d'administration
- ✅ Documentation exhaustive

**Économie vs Doctolib: 3,600€/an → GRATUIT** 🎉

---

**Besoin d'aide?** Consultez la [documentation complète](/PROJECT_COMPLETE.md) ou ouvrez une issue sur GitHub.

**MediCare - L'alternative française gratuite à Doctolib** 🇫🇷🚀
