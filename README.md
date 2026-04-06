# 📚 Guide Simplifié du Site "Génies en Herbe" (GEH Mwanga)

Bienvenue dans le manuel d'utilisation de votre site internet ! 
Ce site a été conçu pour être **totalement gérable sans écrire la moindre ligne de code compliqué**. Les données (scores, équipes, joueurs) sont stockées dans de simples fichiers texte que vous pouvez modifier comme vous le feriez dans Word ou Excel.

> **💡 L'astuce magique :** Vous n'avez même pas besoin de télécharger des logiciels complexes. Vous pouvez faire toutes vos modifications **directement sur le site web de GitHub** (la plateforme où est rangé le code du site), et la mise à jour se fait toute seule !

---

## 📑 Table des matières
1. [Comment modifier les données facilement ?](#1-comment-modifier-les-données-facilement-)
2. [Modifier du texte fixe sur le site (titres, bas de page...)](#2-modifier-du-texte-fixe-sur-le-site-titres-bas-de-page)
3. [Rédiger de longs paragraphes ou résumés](#3-rédiger-de-longs-paragraphes-ou-résumés)
4. [Gérer le Championnat (Ajouter une Édition)](#4-gérer-le-championnat-ajouter-une-édition)
5. [Gérer les Matchs et les Scores](#5-gérer-les-matchs-et-les-scores)
6. [Gérer les Équipes et les Joueurs](#6-gérer-les-équipes-et-les-joueurs)
7. [Ajouter des Photos ou des PDF](#7-ajouter-des-photos-ou-des-pdf)
8. [Mettre en ligne et Configurer l'adresse du site](#8-mettre-en-ligne-et-configurer-ladresse-du-site)
9. [Foire Aux Questions (FAQ)](#9-foire-aux-questions-faq)

---

## 1. Comment modifier les données facilement ?

Les informations automatiques du site (scores, classements) sont rangées dans le dossier **`data/`**. Les fichiers à l'intérieur se terminent par `.json`. 
Un fichier JSON n'est rien d'autre qu'une "liste de tiroirs" très structurée. 

### La règle d'or pour ne rien casser (Très important ⚠️)
* Les textes doivent TOUJOURS être entre guillemets droits : `"Mon texte"`
* Les nombres s'écrivent nus, sans guillemets : `450`
* Si vous avez une liste de choses (ex: plusieurs matchs ou plusieurs joueurs), séparez-les par une virgule `,` 
* **Attention piège :** ne mettez **jamais de virgule après le tout dernier élément** de votre liste.

### La méthode via Internet (en 6 étapes)
Vous n'avez pas besoin d'outils d'informaticiens pour gérer l'actualité de votre site :
1. Allez sur votre espace GitHub et ouvrez le dossier de votre site.
2. Allez dans le dossier `data/` et cliquez sur le fichier que vous voulez changer (ex: `matchs.json`).
3. Cliquez sur le petit bouton **"Crayon" ✏️** en haut à droite de l'écran pour modifier le texte.
4. Faites vos ajustements (ajouter un score, mettre le nom d'un joueur...).
5. En haut à droite de la page, cliquez sur le bouton vert **"Commit changes..."** (Ce qui signifie "Enregistrer et Publier mes modifications en ligne").
6. Patientez environ 2 minutes, actualisez votre site web, et voilà !

---

## 2. Modifier du texte fixe sur le site (titres, bas de page...)

Parfois, vous voudrez changer une phrase d'accueil, un mot, ou le texte tout en bas du site (le footer). Ce genre de texte n'est pas dans le dossier `data/`, mais **directement sur les pages web**.

Les pages web sont les fichiers qui se terminent par `.html` (ex: `index.html` pour l'accueil, `palmares.html` pour le palmarès).

1. Ouvrez le fichier de la page que vous voulez modifier (ex: `index.html`) sur GitHub.
2. Cliquez sur le Crayon ✏️.
3. Utilisez la fonction "Rechercher" de votre navigateur (`Ctrl+F` sur Windows) pour trouver la phrase exacte que vous cherchez (par exemple "Le championnat intellectuel de référence").
4. Changez simplement les mots.
5. **Règle absolue :** Ne supprimez ou ne touchez jamais aux chevrons `<` et `>` qui entourent le texte (ex: `<p>Mon super texte</p>`). Ils indiquent à l'ordinateur où s'affiche la couleur et la forme, modifiez seulement le texte au milieu !
6. Cliquez sur "Commit changes..." pour valider.

---

## 3. Rédiger de longs paragraphes ou résumés

Lorsque vous écrivez le résumé d'un match ou les "faits marquants" dans les fichiers en `.json`, il y a un petit piège de l'informatique :
**Vous ne pouvez pas appuyer sur la touche "Entrée" pour sauter une ligne !** Si votre texte prend 5 lignes avec des retours à la ligne, le fichier `.json` va se fâcher et générer une erreur.

**Comment faire alors ?**
Votre texte doit toujours tenir sur une seule ligne rectiligne entre les deux guillemets.
Si vous souhaitez forcer un retour à la ligne (faire un paragraphe), tapez exactement ceci : `<br><br>`

*Exemple Incorrect (Plante le site) :*
```json
"resume": "C’était une belle finale.
L'équipe A a bien joué."
```

*Exemple Correct (Affiche un beau paragraphe) :*
```json
"resume": "C’était une belle finale.<br><br>L'équipe A a bien joué."
```

---

## 4. Gérer le Championnat (Ajouter une édition)
**Fichier à modifier : `data/editions.json`**

Pour ajouter la nouvelle année, copiez un bloc existant et collez-le au tout début de la liste.

```json
{
  "id": "2024-2025",
  "theme": "L'excellence par le savoir",
  "champion": "6e_sciences",
  "finaliste": "5e_lettres",
  "mvp": "joueur_004",
  "mvp_nom": "David Kasongo",
  "statut": "terminee",
  "active": true
}
```
* **`id`** : L'année scolaire (c'est le "code" utilisé pour la reconnaître).
* **`champion`, `finaliste`, `mvp`** : Écrivez ici les codes d'identification (les "ids") des équipes ou des joueurs.
* **Attention Championnat en cours :** Si le championnat n'est pas fini, écrivez `null` (sans guillemets) pour les vainqueurs.
* **`mvp_nom`** : Si vous n'avez pas l'id exact du MVP ou pour les veilles archives, écrivez juste son prénom et nom ici.
* **`statut`** : Écrivez `"en_cours"` ou `"terminee"`.

---

## 5. Gérer les Matchs et les Scores
**Fichier à modifier : `data/matchs.json`**

```json
{
  "id": "2024-2025-M01",
  "edition": "2024-2025",
  "equipe_A": "6e_sciences",
  "equipe_B": "5e_lettres",
  "score_A": 480,
  "score_B": 420,
  "vainqueur": "6e_sciences",
  "homme_du_match": "joueur_004",
  "resume": "Un match exceptionnel avec un suspense insoutenable..."
}
```
* **`equipe_A` et `equipe_B`** : Utilisez toujours le "code" de l'équipe (ex: `6e_sciences`, au lieu de "6ème Sciences - Classe A"). L'ordinateur liera vers le bon profil !
* **`homme_du_match`** : Le code (id) du meilleur joueur du match (ex: `joueur_004`). Cela affichera automatiquement sa photo. S'il n'y a pas d'homme du match, écrivez `null`.

---

## 6. Gérer les Équipes et les Joueurs
**Fichier à modifier : `data/equipes.json`**

Dans l'onglet équipe, l'édition permet d'insérer des sportifs.

```json
{
  "id": "6e_sciences",
  "nom_officiel": "6ème Sciences",
  "logo": "6e_sciences.png",
  "joueurs": [
    {
      "id": "joueur_004",
      "nom": "Kasongo",
      "prenom": "David",
      "photo": "joueur_004.jpg",
      "stats": {
        "points_totaux": 1250,
        "victoires": 8
      }
    }
  ]
}
```
* **Le Classement Automatisé** : Plutôt que de mettre à jour un fichier excel laborieux pour générer le palmarès, **il vous suffit d'incrémenter le nombre** dans `"points_totaux"` et `"victoires"` du fichier Json pour chaque joueur. L'application calcule les moyennes !

---

## 7. Ajouter des Photos ou des PDF

Le système visuel GEH Mwanga est intelligent. Vous n'avez pas besoin de recourir à Photoshop.

* **Où mettre les photos des joueurs ?** Dans le dossier `assets/images/avatars/`. Le nom de la photo doit refléter celui du données (ex: `joueur_004.jpg`).
* **Si je n'ai pas la photo du joueur ?** Le site va générer automatiquement une bulle design aux couleurs du site avec les initiales du joueur !
* **Où mettre les PDF des classements complets ?** Dans le dossier `assets/pdf/resultats/`. 

---

## 8. Déployer le site gratuitement et configurer son adresse

L'incroyable avantage de GitHub est qu'il peut héberger votre site web **100% gratuitement** pour toujours via son outil "GitHub Pages".

### Étape 1 : Activer l'hébergement gratuit (GitHub Pages)
Si ce n'est pas déjà fait pour lancer le site pour la première fois :
1. Allez sur la page de votre projet sur GitHub.com.
2. Cliquez sur l'onglet **"Settings"** ⚙️ (Paramètres) en haut.
3. Dans le menu de gauche, descendez et cliquez sur **"Pages"**.
4. Sous la rubrique *Build and deployment*, regardez la section *Branch*. Cliquez sur le menu déroulant qui indique *None*, et sélectionnez **"main"** (ou "master").
5. Cliquez sur le bouton **Save**.
6. Patientez 2 à 3 minutes. Sur cette même page, un message vert apparaîtra : *"Your site is published at https://votre-compte.github.io/votre-projet/"*. 
**Félicitations, votre site est en ligne !** Copiez cette adresse web.

### Étape 2 : Configurer les adresses
Le site a besoin de connaître sa propre adresse internet pour partager les bons liens et être trouvé sur Google.

1. **Le fichier de configuration principal (`data/config.json`)** :
   Ouvrez ce fichier. Remplacez le contenu de la ligne `"site_url"` par l'adresse copiée à l'étape précédente (sans le `/` à la fin). Par exemple : `"site_url": "https://mon-ecole.github.io/GEH-Mwanga"`.

2. **Le Plan du site pour Google (`sitemap.xml`)** :
   Ce fichier liste toutes vos pages pour le robot de recherche Google. Ouvrez-le, et utilisez la fonction "Rechercher et remplacer" (Ctrl+H ou via le site GitHub) pour remplacer toutes les anciennes adresses par votre nouvelle adresse gratuite GitHub.

### À Propos de vos futurs Déploiements :
Maintenant que le site est publié via GitHub Pages, **plus besoin de refaire l'Étape 1**. À chaque fois que vous utiliserez la méthode du "Crayon ✏️" sur un fichier et que vous cliquerez sur "Commit changes", le déploiement sur Internet **sera 100% automatique**. Le site se mettra à jour sur l'adresse gratuite en 2 minutes.

*(Pour les initiés)* : Si vous modifiez les fichiers en local sur un ordinateur, les 3 commandes habituelles suffisent pour déclencher la mise en ligne automatique :
`git add .`
`git commit -m "Explication de la modification"`
`git push`

---

## 9. Foire Aux Questions (FAQ)

**Q: Au secours ! J'ai modifié un score, et mon site web affiche subitement une page blanche. Pourquoi ?**
*R: Vous avez sûrement oublié de fermer un guillemet (`"`) ou vous avez oublié une virgule (`,`) entre deux blocs. Vous pouvez copier votre texte sur [JSONLint.com](https://jsonlint.com/) pour qu'il cible en rouge l'endroit de l'erreur typographique.*

**Q: Comment marquer la nouvelle saison scolaire comme "Celle en cours" pour la bannière de la page d'accueil ?**
*R: Éditez le petit fichier `data/config.json` et remplacez l'année dans le champ `"currentEdition"` par votre nouvelle rentrée (ex: `"2025-2026"`).*

**Q: Si je suis débutant(e), puis-je tout casser si je fais une erreur sur le code html ?**
*R: Absolument pas ! GitHub garde un historique illimité de toutes vos sauvegardes. Si vous supprimez par inadvertance, vous pouvez cliquer sur le petit lien "History" à droite du fichier pour rétablir en un clic la disposition de la veille !*

---
*GEH Mwanga — Guide rédigé pour simplifier la vie des comités administratifs non développeurs.*
