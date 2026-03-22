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
# Modifier .env avec vos paramètres (voir section Variables d'environnement)

# 3. Initialiser la base de données
npx prisma migrate dev --name init
npm run db:seed

# 4. Démarrer
npm run dev
```

## Déploiement sur Railway

1. Fork ce repository
2. Créer un nouveau projet sur [Railway](https://railway.com)
3. **Ajouter un service PostgreSQL** depuis le dashboard Railway
4. **Connecter votre repository GitHub en ajoutant un nouveau service Web**
5. Railway détectera automatiquement `railway.toml` et utilisera le Dockerfile
6. **IMPORTANT: Vérifier que DATABASE_URL est injecté correctement**
   - Aller dans le service Web → Variables → vérifier que `DATABASE_URL` est présent
   - Sa valeur doit être de la forme: `postgresql://...`
   - **Si manquant ou mal formé, l'app aura l'erreur: "The table `main.User` does not exist"**

7. Dans les variables d'environnement du service Web, ajouter:
   - `ADMIN_EMAIL` : votre email (ex: `jean@example.com`)
   - `ADMIN_PASSWORD` : votre mot de passe sécurisé
   - `NEXT_PUBLIC_APP_URL` : l'URL de votre app Railway (ex: `https://ducpanel-prod.up.railway.app`)
   - `JWT_SECRET` : une chaîne aléatoire de 32+ caractères

8. Redéployer depuis Railway si nécessaire

### Diagnostic sur Railway

Si vous avez une erreur `"The table 'main.User' does not exist"` au login:

```bash
# Accédez à votre app via: https://your-app-url.up.railway.app/api/health
# Cela affichera le statut de connexion à la base de données
```

## Déploiement sur Render

1. Fork ce repository
2. Créer un nouveau service Web sur [Render](https://render.com)
3. **Créer une base PostgreSQL Render et la lier au service Web**
4. Connecter votre repository GitHub
5. Render détectera automatiquement `render.yaml`
6. Configurer les variables d'environnement :
   - `DATABASE_URL` : auto-injectée/liée de la base PostgreSQL
   - `ADMIN_EMAIL` : votre email
   - `ADMIN_PASSWORD` : votre mot de passe
   - `NEXT_PUBLIC_APP_URL` : l'URL de votre app Render
   - `JWT_SECRET` : une clé secrète (32+ chars)

## Variables d'environnement

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` | ✓ |
| `JWT_SECRET` | Secret JWT (32+ chars) | `your-random-secret-here-at-least-32-chars` | ✓ |
| `ADMIN_EMAIL` | Email de connexion admin | `jean@example.com` | ✓ |
| `ADMIN_PASSWORD` | Mot de passe admin | `securepwd123` | ✓ |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `https://mon-app.up.railway.app` | ✓ |
| `UPLOAD_DIR` | Dossier uploads | `/app/uploads` (Railway) ou `/opt/render/project/uploads` (Render) | Non |

### Vérifier la configuration

Une fois déployé, vérifier que tout fonctionne:

```bash
# Vérifier la santé et la connexion DB
curl https://your-app-url/api/health

# Doit retourner:
# {
#   "status": "✓ Connected",
#   "diagnostics": { "dbUrlFormat": "PostgreSQL", ... }
# }
```