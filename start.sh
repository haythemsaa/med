#!/bin/bash

# MediCare - Quick Start Script
# Démarre l'application complète en 1 commande

set -e

echo "🏥 MediCare - Démarrage de l'application..."
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    echo "   → https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

echo "✅ Docker est installé"
echo ""

# Créer les fichiers .env s'ils n'existent pas
if [ ! -f backend/.env ]; then
    echo "📝 Création du fichier backend/.env..."
    cat > backend/.env << EOF
DATABASE_URL="postgresql://medicare:medicare_dev_password@localhost:5432/medicare_db"
JWT_SECRET="medicare_jwt_secret_change_in_production"
JWT_REFRESH_SECRET="medicare_jwt_refresh_secret_change_in_production"
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3001,http://localhost:19006"
EOF
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Création du fichier frontend/.env..."
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:3000/api/v4
PORT=3001
EOF
fi

if [ ! -f mobile/.env ]; then
    echo "📝 Création du fichier mobile/.env..."
    cat > mobile/.env << EOF
API_URL=http://localhost:3000/api/v4
EOF
fi

echo "✅ Fichiers de configuration créés"
echo ""

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Construire et démarrer les conteneurs
echo "🏗️  Construction des images Docker..."
docker-compose build

echo ""
echo "🚀 Démarrage des services..."
docker-compose up -d

echo ""
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier que les services sont démarrés
echo "🔍 Vérification des services..."

if curl -s http://localhost:3000/api/v4/health > /dev/null 2>&1; then
    echo "✅ Backend API: http://localhost:3000"
else
    echo "⚠️  Backend API: En cours de démarrage..."
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend Web: http://localhost:3001"
else
    echo "⚠️  Frontend Web: En cours de démarrage..."
fi

echo "✅ Database: http://localhost:8080 (Adminer)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 MediCare est démarré avec succès!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Accès aux applications:"
echo ""
echo "   🌐 Frontend Web:    http://localhost:3001"
echo "   🔧 Backend API:     http://localhost:3000"
echo "   📊 API Docs:        http://localhost:3000/api/v4/docs"
echo "   🗄️  Adminer (DB):   http://localhost:8080"
echo ""
echo "👤 Compte de démonstration:"
echo ""
echo "   Email:     demo@medicare.com"
echo "   Password:  demo123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Commandes utiles:"
echo ""
echo "   Voir les logs:        docker-compose logs -f"
echo "   Arrêter:              docker-compose down"
echo "   Redémarrer:           docker-compose restart"
echo "   Voir les services:    docker-compose ps"
echo ""
echo "📱 Pour l'application mobile:"
echo ""
echo "   cd mobile"
echo "   npm install"
echo "   npm start"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
