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

## Déploiement sur Railway

1. Fork ce repository
2. Créer un nouveau projet sur [Railway](https://railway.com)
3. Ajouter un service **PostgreSQL** depuis le dashboard Railway
4. Connecter votre repository GitHub en ajoutant un nouveau service Web
5. Railway détectera automatiquement `railway.toml`
6. Dans les variables d'environnement du service Web, ajouter :
   - `DATABASE_URL` : copiez la variable `DATABASE_URL` fournie par le service PostgreSQL Railway
   - `ADMIN_EMAIL` : votre email
   - `ADMIN_PASSWORD` : votre mot de passe
   - `NEXT_PUBLIC_APP_URL` : l'URL de votre app Railway (ex: `https://mon-app.up.railway.app`)
   - `JWT_SECRET` : une chaîne aléatoire de 32+ caractères
   - `UPLOAD_DIR` : `/app/uploads` (optionnel)

## Déploiement sur Render

1. Fork ce repository
2. Créer un nouveau service Web sur [Render](https://render.com)
3. Créer une base PostgreSQL sur Render et la lier au service Web
4. Connecter votre repository GitHub
5. Render détectera automatiquement `render.yaml`
6. Configurer les variables d'environnement :
   - `DATABASE_URL` : URL PostgreSQL (automatiquement injectée si vous utilisez le blueprint `render.yaml`)
   - `ADMIN_EMAIL` : votre email
   - `ADMIN_PASSWORD` : votre mot de passe
   - `NEXT_PUBLIC_APP_URL` : l'URL de votre app Render
   - `JWT_SECRET` : généré automatiquement

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret JWT (32+ chars) | `random-secret` |
| `ADMIN_EMAIL` | Email de connexion | `jean@example.com` |
| `ADMIN_PASSWORD` | Mot de passe | `monmotdepasse` |
| `UPLOAD_DIR` | Dossier uploads | `./uploads` |
| `NEXT_PUBLIC_APP_URL` | URL de l'app | `https://mon-app.up.railway.app` |