# Label Impact — Frontend

Projet frontend Next.js pour la découpe et l'envoi de fiches PDF.

## Aperçu
- Framework : Next.js 16 + React 19
- Objectif : télécharger un PDF, le découper côté backend en plusieurs fiches (par matricule) puis permettre le téléchargement individuel ou l'envoi par email d'une fiche.
- Composants principaux :
  - `components/pdf-splitter.tsx` : UI pour sélectionner un PDF, lancer le découpage et lister les fiches découpées. Supporte : téléchargement individuel, téléchargement en masse (avec File System Access API) et envoi par email (via endpoint backend).
  - `components/email-sender.tsx` : (composant auxiliaire pour l'envoi d'emails si présent)
  - `components/ui/*` : bibliothèque de composants UI réutilisables (Button, Input, Card, etc.).

## Prérequis
- Node.js (recommandé v18+)
- pnpm (le projet contient un `pnpm-lock.yaml`) — vous pouvez aussi utiliser `npm` ou `yarn`, mais les commandes documentées utilisent `pnpm`.
- Backend disponible localement (ex: `http://localhost:3600`) exposant au minimum :
  - `POST /api/upload` : pour uploader le PDF et renvoyer `{ message: 'ok', downloadLinks: [{ matricule, url }, ...] }`
  - `POST /api/send-email` : pour demander l'envoi d'une fiche par email. Payload attendu (implémentation actuelle) : `{ fileUrl, matricule, recipient }` et doit renvoyer `{ message: 'ok' }` en cas de succès.

> Important : le frontend lit un `token` depuis `localStorage` (clé `token`) et l'envoie dans l'entête `Authorization: Bearer <token>` pour les endpoints. Assurez-vous d'être authentifié (stocker le token) avant d'utiliser le découpage/envoi.

## Installation
1. Installer les dépendances :

```bash
pnpm install
```

2. Lancer le serveur de développement :

```bash
pnpm dev
```

Le frontend sera disponible sur `http://localhost:3000` par défaut.

## Scripts utiles (depuis `package.json`)
- `pnpm dev` — démarre le serveur de développement (`next dev`)
- `pnpm build` — compile pour la production (`next build`)
- `pnpm start` — démarre l'application en production (`next start`)
- `pnpm lint` — lance ESLint

## Utilisation — découpage et envoi
1. Ouvrir la page contenant `PdfSplitter` (ex : `app/page.tsx` ou route dédiée dans l'app).
2. Cliquer sur "Parcourir" et sélectionner un fichier PDF.
3. Cliquer sur "Lancer le découpage" — le composant upload le PDF vers `POST /api/upload`.
4. Si le backend renvoie `downloadLinks`, la liste des fiches s'affiche avec deux actions par fiche :
   - `Télécharger` : télécharger la fiche localement (utilise File System Access API si disponible, sinon fallback via `<a download>`).
   - `Envoyer` : invite à saisir l'adresse email du destinataire puis appelle `POST /api/send-email` avec `{ fileUrl, matricule, recipient }`.

Comportement important :
- Le composant conserve `downloadLinks` dans `localStorage` pour permettre la récupération après rafraîchissement.
- L'envoi par email lit le token depuis `localStorage` et le passe au backend dans l'entête `Authorization`.

## Sécurité et conseils
- Ne stockez pas de tokens non chiffrés en production sur `localStorage` si possible ; préférez des cookies HTTP-only.
- Validez côté backend les droits d'accès au fichier avant d'autoriser l'envoi par email.
- Limitez la taille des fichiers uploadés côté backend et renvoyez des erreurs claires au frontend.

## Développement & amélioration suggérée
- Remplacer `window.prompt` par un modal dédié pour une meilleure UX (composant `EmailSender` ou `Dialog` dans `components/ui`).
- Ajouter toasts (ex: `sonner`) au lieu des `alert()` pour un feedback moins intrusif.
- Ajouter tests unitaires pour les helpers du composant (mock fetch / File System API).
- Supporter l'envoi direct du blob au backend si l'API l'exige (au lieu d'envoyer l'URL du fichier).

## Structure du projet (sélectif)
- `app/` — routes et pages (Next.js App Router)
- `components/` — composants réutilisables et spécifiques (`pdf-splitter.tsx`, `email-sender.tsx`, `ui/*`)
- `hooks/` — hooks custom (ex: `use-toast`, `use-mobile`)
- `public/` — ressources publiques
- `styles/` — styles globaux

## Backend attendu
- Le frontend est découplé du backend. Pour tester l'intégration complète, démarrez l'API backend sur `http://localhost:3600` (exemple) et vérifiez les endpoints listés plus haut.

## Questions / prochaines étapes
- Voulez-vous que je :
  - remplace le `prompt` par un vrai modal d'email (je peux l'implémenter) ?
  - adapte l'appel `POST /api/send-email` si votre backend attend un autre format ?

---
README généré automatiquement par l'assistant. Ajustez selon vos endpoints backend réels ou préférences.
