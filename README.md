# 🦆 Duc Panel

Tableau de bord personnel avec prise de notes et mini cloud.

## Fonctionnalités

- 🔐 Authentification sécurisée (JWT + bcrypt)
- 📝 Prise de notes (CRUD complet)
- ☁️ Mini Cloud (upload/galerie/partage d'images)
- 🦆 Interface duck-themed avec salutation personnalisée

## Installation locale

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Modifier .env avec vos paramètres

# 3. Initialiser la base de données
npx prisma migrate dev --name init
npm run db:seed

# 4. Démarrer
npm run dev
```

## Déploiement sur Render

1. Fork ce repository
2. Créer un nouveau service Web sur [Render](https://render.com)
3. Connecter votre repository GitHub
4. Render détectera automatiquement `render.yaml`
5. Configurer les variables d'environnement :
   - `ADMIN_EMAIL` : votre email
   - `ADMIN_PASSWORD` : votre mot de passe
   - `NEXT_PUBLIC_APP_URL` : l'URL de votre app Render
   - `JWT_SECRET` : généré automatiquement

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Chemin SQLite | `file:./data/duck.db` |
| `JWT_SECRET` | Secret JWT (32+ chars) | `random-secret` |
| `ADMIN_EMAIL` | Email de connexion | `jean@example.com` |
| `ADMIN_PASSWORD` | Mot de passe | `monmotdepasse` |
| `UPLOAD_DIR` | Dossier uploads | `./uploads` |
| `NEXT_PUBLIC_APP_URL` | URL de l'app | `https://mon-app.onrender.com` |