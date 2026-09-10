# ARTIFY

Version corrigée de l'index.

## Structure

- `index.html`
- `images/` : visuels locaux
- `api/generate.js` : emplacement du backend IA
- `package.json`
- `vercel.json`

## Test

Ouvrir `index.html`. Le bouton « Créer mon tableau » utilise maintenant des liens d'ancrage HTML (`#creer`) et fonctionne sans dépendre d'une fonction popup.

Le créateur local permet :
- import de photo
- choix de style
- prompt
- 3 essais
- aperçu
- téléchargement

La génération locale est une démonstration. La vraie IA et le paiement doivent être connectés côté serveur avant la commercialisation.
