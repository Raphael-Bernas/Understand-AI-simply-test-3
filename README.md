# AI Vector Explorer (FR/GB)

Jeu éducatif interactif (collège) pour comprendre qu'un modèle de langage traverse des couches de transformation et qu'on évalue aussi ses erreurs.

## Ouvrir en local
- Téléchargez les fichiers.
- Ouvrez `index.html` dans un navigateur moderne.

## Déployer sur GitHub Pages
1. Créez un dépôt GitHub et poussez ces 4 fichiers.
2. Dans **Settings > Pages**, choisissez la branche principale (`main`) et le dossier root.
3. Sauvegardez, puis ouvrez l'URL Pages générée.

## Fonctionnement du jeu
- 5 phrases fixes.
- Chaque phrase a plusieurs mots manquants.
- Pour chaque mot manquant: 20 candidats, 1 seul correct.
- Le mot sélectionné est **toujours** le plus probable (rang #1).
- Appuyez sur **Entrée** pour valider ce mot.

## Pipeline visuel
Préfixe de phrase → vecteur 2D → matrice M1 contrôlée par l'élève → matrice M2 fixe → probabilités (softmax) triées.

## Contrôles matrice
- **Knob rotation**: tourne la matrice M1 en continu.
- **Slider vertical**: module l'étirement anisotrope (un axe grandit, l'autre rétrécit).
- Les coefficients de M1, les vecteurs transformés et les probabilités changent en continu.
- Des flèches/indices rouges donnent une direction d'amélioration approximative (gradient).

## Score
- Le score = nombre d'erreurs.
- **Lower score = better** / **Score plus bas = meilleur**.
- But: finir les 5 phrases avec le score le plus bas.

## Langues FR / GB
- Bascule FR/GB en haut de l'interface.
- Par défaut: FR.
- Le changement traduit l'UI, les phrases et les mots candidats.

## Reset
- Bouton reset/retry intégré.
- Mot de passe requis: `Admin0000`.
- Si correct: reprise complète depuis le début.
