# Obsidian Academic Dashboard Plugin 🎓

Ce plugin offre un tableau de bord complet pour gérer vos cours universitaires, suivre votre progression, visualiser vos échéances et gérer vos sessions de travail Pomodoro directement depuis Obsidian.

![dashboard image](https://github.com/a-phe-lei-a/obsidian-academic-dashboard/blob/main/assets/Dashboard.png?raw=true)

## Fonctionnalités Principales

-   **Vue d'Ensemble Semestrielle** : Regroupe automatiquement vos cours par semestre (S1/S2) et par Unité d'Enseignement (UE).
-   **Suivi Pomodoro** :
    -   Estimation de la charge de travail basée sur le volume horaire du cours.
    -   Suivi des sessions réalisées via des tags dans vos tâches (`[🍅:: 1]`) ou le plugin [pomodoro timer](https://github.com/eatgrass/obsidian-pomodoro-timer).
-   **Barres de Progression** : Visualisez l'avancement du semestre et des périodes de supervision en temps réel.
-   **Gestion des Évaluations** : Étiquettes colorées personnalisables pour identifier rapidement le type d'examen (Dossier, Table, QCM, etc.).
-   **Dates Clés** : Affichage automatique des dates d'examen (Session 1 et 2).
-   **Mise à jour Automatique** : Le tableau de bord se rafraîchit automatiquement lorsque vous modifiez vos notes.
-   **Tâches Repliables** : Les listes de tâches se replient automatiquement lorsque toutes les tâches sont terminées, affichant un résumé compact "Toutes les tâches sont terminées".
-   **Indicateur Visuel de Complétion** : Les cours (EC) entièrement terminés s'affichent avec une bordure et une teinte vertes, s'intégrant au thème, pour une validation visuelle immédiate.
-   **Design Natif** : Une interface utilisateur qui s'intègre parfaitement au thème d'Obsidian.

---

## Installation

1.  Téléchargez le dossier `academic-dashboard`.
2.  Placez-le dans votre dossier de vault : `.obsidian/plugins/`.
3.  Relancez Obsidian.
4.  Activez le plugin dans les paramètres d'Obsidian.
5.  Cliquez sur l'icône "Chapeau de diplômé" (🎓) dans le ruban gauche ou utilisez la commande "Open Academic Dashboard".

---

## Configuration de vos Notes (Frontmatter)

Pour qu'une note apparaisse dans le tableau de bord, elle doit contenir certaines propriétés YAML (Frontmatter). Voici les propriétés par défaut (vous pouvez les changer dans les paramètres) :

```yaml
---
ied_ec_academic_year: 2025-2026   # Obligatoire pour le filtrage
ied_ec_semestre: S1               # "S1" ou "S2"
ied_ue: UE 1 - Psychologie        # Nom de l'Unité d'Enseignement pour le regroupement
ied_ec_volume: 24                 # Volume horaire en heures (pour le calcul Pomodoro) (Optionnel)
ied_ec_evaluation_type: Dossier   # Type d'évaluation (ex: Dossier, Table) (Optionnel)
ied_ec_session_1: 2026-01-15      # Date de l'examen session 1 (Optionnel)
ied_ec_session_2: 2026-06-20      # Date de l'examen session 2 (Optionnel)
ied_ec_supervision_start: 2025-10-01 # Début de supervision (Optionnel)
ied_ec_supervision_end: 2026-05-01   # Fin de supervision (Optionnel)
---
```

### Suivi des Tâches (Pomodoro)

Dans le corps de votre note générale de l'EC, vous pouvez créer des tâches pour chaque chapitre. Pour comptabiliser des sessions de travail "faites", ajoutez le tag `[🍅:: N]` à la fin de la ligne, où `N` est le nombre de pomodoros réalisés.

Exemple :
```markdown
- [ ] Lire le chapitre 1 [🍅:: 1]
- [x] Rédiger l'introduction [🍅:: 3]
```

Le tableau de bord affichera alors : `🍅 4 / X`, où `X` est l'estimation basée sur le volume horaire global.

---

## Paramètres du Plugin

Allez dans **Settings > Academic Dashboard** pour configurer :

### Général
-   **Langue** : Français / Anglais.
-   **Titre du Dashboard** : Personnalisez le nom de l'onglet.
-   **Année Cible** : Définissez quelle année scolaire afficher (ex: `2025-2026`). Seules les notes avec cette valeur dans `ied_ec_academic_year` s'afficheront.

### Calendrier Semestriel
-   Définissez les **dates de début et de fin** pour le Semestre 1 et 2. Cela active les barres de progression globales en haut de chaque section.

### Visuels & Fonctionnalités
-   **Minuteur Pomodoro** : Durée en minutes d'une session (défaut : 40 min). Utilisé pour convertir le volume horaire du cours en nombre de tomates cibles.
-   **Couleurs d'Évaluation** : Associez un type (ex: "Table") à une couleur (ex: Rouge `#ff5555`). Le tableau de bord colorera automatiquement l'étiquette correspondante.

### Avancé (Propriétés)
-   Si vous utilisez déjà d'autres noms de propriétés dans votre vault, vous pouvez remapper toutes les clés ici (ex: changer `ied_ec_academic_year` par `annee`).

---

## Support

Si vous rencontrez des problèmes d'affichage :
1.  Vérifiez que l'année dans les paramètres correspond exactement à celle dans vos notes.
2.  Vérifiez que le plugin est bien activé.
3.  Ouvrez la console de développement (`Ctrl+Shift+I` / `Cmd+Option+I`) pour voir les erreurs éventuelles.
