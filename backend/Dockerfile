FROM node:18

# Crée un répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code (y compris scripts/)
COPY . .

# Exposer le port
EXPOSE 5000

# Commande par défaut
CMD ["npm", "start"]
