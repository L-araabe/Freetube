# fichier: restart-docker.ps1
Write-Host "Arrêt des containers existants..."
docker-compose down

Write-Host "Construction des images..."
docker-compose build

Write-Host "Démarrage des containers..."
docker-compose up -d

Write-Host "Logs du backend en direct (Ctrl+C pour quitter)..."
docker-compose logs -f backend
