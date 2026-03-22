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

## Déploiement sur Railway (Recommandé)

### Configuration requise

1. **Railway Project** - Créer un nouveau projet sur [Railway](https://railway.com)
2. **PostgreSQL Database** - Ajouter une base de données PostgreSQL depuis le dashboard
3. **Repository GitHub** - Fork ce repository et connecter à Railway

### Étapes de déploiement

1. Fork ce repository sur GitHub
2. Dans Railway, créer un **nouveau projet**
3. **Ajouter un service PostgreSQL** (templates → PostgreSQL → Deploy)
4. **Ajouter un service Web**:
   - Sélectionner "Repo" et connecter votre fork
   - Railway détectera automatiquement le `Dockerfile`
   - Laisser Railway configurer le déploiement

5. **Lier PostgreSQL au Web service**:
   - Dans le service Web, aller à l'onglet "Variables"
   - Railway devrait avoir ajouté automatiquement `DATABASE_URL`
   - **Vérifier que DATABASE_URL existe et commence par `postgresql://`**

6. **Ajouter variables d'environnement** (Web service → Variables):

| Variable | Valeur | Exemple |
|----------|--------|---------|
| `ADMIN_EMAIL` | Email de connexion | `admin@example.com` |
| `ADMIN_PASSWORD` | Mot de passe sécurisé | `MyStrongPassword123!` |
| `JWT_SECRET` | Clé secrète (32+ chars) | `your-random-secret-32-characters-here` |
| `NEXT_PUBLIC_APP_URL` | URL public de l'app (optional) | `https://ducpanel.up.railway.app` |
| `UPLOAD_DIR` | Dossier uploads (optional) | `/app/uploads` |

7. **Déployer**: Railway va automatiquement réaliser un redéploiement

### Diagnostic des problèmes

#### ❌ Erreur: "Unable to require libquery_engine-linux-musl.so.node"

**Cause**: Alpine Linux manque OpenSSL
**Solution**: Docker image automatiquement utilise Debian (bookworm) - redéployer

#### ❌ Erreur: "Can't reach database server at `opt:5432`"

**Cause**: DATABASE_URL est malformée ou vide
**Action**:
1. Aller dans Railway → Web service → Variables
2. **Vérifier qu'il y a une variable `DATABASE_URL`**
3. **Sa valeur doit commencer par `postgresql://` ou `postgres://`**
4. Si elle n'existe PAS ou est vide:
   - Railway → PostgreSQL service → onglet "Variables"
   - Copier la valeur de `DATABASE_URL` de là
   - Coller dans le service Web → Variables
5. **Redéployer le service Web**

#### ❌ Erreur: "The table 'main.User' does not exist"

**Cause**: Migrations n'ont pas runs (Database_URL pointait vers SQLite)
**Solution**: Corriger DATABASE_URL (voir ci-dessus), puis redéployer

#### ✅ Vérifier la Health

```bash
curl https://your-app-url.up.railway.app/api/health

# Doit retourner:
{
  "status": "✓ Connected",
  "diagnostics": {
    "dbUrlFormat": "PostgreSQL",
    "dbHost": "your-db-host"
  }
}
```

## Variables d'environnement

| Variable | Description | Exemple | Requis |
|----------|-------------|---------|--------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@host:5432/db` | ✓ (auto) |
| `JWT_SECRET` | Secret JWT (32+ chars) | `your-random-secret-here-at-least-32-chars` | ✓ |
| `ADMIN_EMAIL` | Email de connexion admin | `admin@example.com` | ✓ |
| `ADMIN_PASSWORD` | Mot de passe admin | `SecurePassword123!` | ✓ |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `https://ducpanel.up.railway.app` | Non |
| `UPLOAD_DIR` | Dossier uploads | `/app/uploads` | Non |
| `NODE_ENV` | Environnement | `production` | Auto |

## Architecture

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: JWT + bcryptjs
- **Deployment**: Docker → Railway