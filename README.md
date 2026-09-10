# ARTIFY

Site vitrine ARTIFY — création de tableaux personnalisés à partir de photos.

## Structure

- `index.html` — site complet
- `images/` — images locales utilisées par le site
- `api/generate.js` — endpoint réservé à la future génération IA
- `vercel.json` — configuration Vercel
- `package.json` — configuration du projet

## Déploiement Vercel

Le projet est conçu pour être déployé depuis la racine du dépôt.

Si Vercel affiche `404 NOT_FOUND`, vérifier dans **Project Settings → Build and Deployment → Root Directory** que le dossier sélectionné est la racine du dépôt (et non `api`, `images` ou un sous-dossier).

Aucun build command n'est nécessaire pour la partie statique : `index.html` est servi directement.

## Important

La génération IA réelle n'est pas encore branchée dans cette version. Le bouton de création fonctionne en aperçu local dans le navigateur. Pour une vraie génération IA, il faudra connecter `api/generate.js` à l'API d'image avec une variable d'environnement `OPENAI_API_KEY` côté serveur.
