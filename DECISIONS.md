# Architectural Decisions - GEH Mwanga Website

To ensure the best balance between performance, SEO, and maintainability, the following technical choices have been made for the official GEH Mwanga website:

## 1. Single-Template Routing (Client-Side)
Instead of creating dozens of identical HTML files for each edition or match, we use a single entry point for each resource type (`edition.html`, `match.html`, `equipe.html`).
- **Mechanism**: The page reads the ID from the URL (e.g., `edition.html?id=2024-2025`) and fetches the corresponding data from the JSON store.
- **Benefits**: Centralized logic, easier maintenance, and consistent structure.

## 2. JSON-First Data Layer
All competition data is centralized in the `/data/` directory.
- `config.json`: Global site variables.
- `editions.json`: List of all editions since 2013-2014.
- `equipes.json`: Master list of all teams and classes.
- `matchs.json`: Result database.
- `palmares.json`: Champion history.
- `statistiques.json`: Aggregated performance metrics.

## 3. Vanilla CSS with CSS Variables
We avoid heavy CSS frameworks to maintain a unique, premium institutional aesthetic.
- **Theming**: All colors (Blue, Red, Green, Gold) are defined as CSS variables in `:root`.
- **Modularity**: Components (cards, tables, buttons) have their own logic in `components.css` and `tables.css`.

## 4. Realistic Placeholder Strategy
Since actual historical data for 12 editions depends on institutional records, we populate the initial version with:
- **Correct Years**: 2013-2014 to 2024-2025.
- **Fictional Teams**: Based on typical IMGoma class structures (e.g., "6ème Sciences", "5ème Bio-Chimie").
- **Coherent Scores**: Matches with scores ranging from 200 to 500 points, respecting the GEH format.

## 5. Performance & SEO
- **Images**: All assets use `loading="lazy"`.
- **Semantic HTML**: Proper use of `<main>`, `<section>`, `<article>`, and headings.
- **Meta Tags**: Optimized for the Congolese educational context (Institut Mwanga, Goma, RDC).

## 6. Dark Mode
**Decision:** Désactivé.
**Reason:** The institutional visual identity relies heavily on the official colors (Blue, Red, Green, Gold) over a clean, academic white/light surface. A dark mode would dilute the institutional prestige and require complex recoloring of team logos and status badges, creating maintainability overhead for the school's non-technical staff.

## 7. Statistiques.json & Data Aggregation
**Decision:** `statistiques.json` contains pre-calculated aggregates.
**Reason:** To keep client-side rendering fast and avoid heavy array operations on hundreds of matches, historical all-time records (e.g., all-time highest score, most titles) are pre-calculated and manually maintained in `statistiques.json`. The maintainer must update this file when a new record is set. Minor dynamically-filtered stats (like a single edition's highest score) are calculated on the fly in `app.js`.

## 8. Routing Error Handling
**Decision:** Redirect to `404.html`.
**Reason:** If `edition.html?id=inexistant` is accessed, or a match/team ID is not found in the loaded JSON, the data-fetching logic will `window.location.replace('404.html')`. This avoids rendering a broken UI, maintains a professional appearance, and centralizes error messaging without complex inline DOM error states.

## 9. Format of a GEH Match Data Model
**Decision:** Standardized 1050-point structure.
**Reason:** To ensure realistic placeholders and a robust data model, a match follows standard GEH rules:
- **Scoring:** +10 points per correct answer, -10 points for an incorrect answer prior to question completion.
- **Part 1 (~430 points):** Manchettes A-B (20 pts), Mathématiques (100 pts), Sciences (100 pts), Français (100 pts), Histoire-Géo (110 pts).
- **Part 2 (~620 points):** Associations (100 pts), Culture Générale (100 pts), Actualités (100 pts), Sport & Loisirs (50 pts), Mixte (270 pts).
- **Placeholder Values:** Match placeholders will reflect teams scoring between 150 and 550 points per match, to accurately mirror reality.

### Structure du Score par Manche
Le barème GEH plafonne autour de 1050 pts. De nombreux matchs se terminent autour de 900-950 pts distribués parce que certaines questions restent sans réponse des deux côtés. Pour respecter la stricte cohérence comptable, le champ 'non_repondues' est explicitement intégré dans score_par_manche pour totaliser les points virtuellement abandonnés.
