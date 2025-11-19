@echo off
REM MediCare - Quick Start Script for Windows
REM Démarre l'application complète en 1 commande

echo ============================================================
echo     MediCare - Demarrage de l'application
echo ============================================================
echo.

REM Vérifier Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Docker n'est pas installe.
    echo Telechargez Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker est installe
echo.

REM Créer fichiers .env
if not exist backend\.env (
    echo Creation du fichier backend\.env...
    (
        echo DATABASE_URL="postgresql://medicare:medicare_dev_password@localhost:5432/medicare_db"
        echo JWT_SECRET="medicare_jwt_secret_change_in_production"
        echo JWT_REFRESH_SECRET="medicare_jwt_refresh_secret_change_in_production"
        echo NODE_ENV="development"
        echo PORT=3000
        echo CORS_ORIGIN="http://localhost:3001,http://localhost:19006"
    ) > backend\.env
)

if not exist frontend\.env (
    echo Creation du fichier frontend\.env...
    (
        echo REACT_APP_API_URL=http://localhost:3000/api/v4
        echo PORT=3001
    ) > frontend\.env
)

echo [OK] Fichiers de configuration crees
echo.

REM Arrêter les conteneurs existants
echo Arret des conteneurs existants...
docker-compose down 2>nul

REM Construire et démarrer
echo Construction des images Docker...
docker-compose build

echo.
echo Demarrage des services...
docker-compose up -d

echo.
echo Attente du demarrage des services...
timeout /t 10 /nobreak >nul

echo.
echo ============================================================
echo     MediCare est demarre avec succes!
echo ============================================================
echo.
echo Acces aux applications:
echo.
echo    Frontend Web:    http://localhost:3001
echo    Backend API:     http://localhost:3000
echo    API Docs:        http://localhost:3000/api/v4/docs
echo    Adminer (DB):    http://localhost:8080
echo.
echo Compte de demonstration:
echo.
echo    Email:     demo@medicare.com
echo    Password:  demo123
echo.
echo ============================================================
echo.
echo Commandes utiles:
echo.
echo    Voir les logs:        docker-compose logs -f
echo    Arreter:              docker-compose down
echo    Redemarrer:           docker-compose restart
echo.
echo ============================================================
echo.
pause
