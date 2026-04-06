const fs = require('fs');
let css = fs.readFileSync('assets/css/main.css', 'utf8');

const additionalCSS = 
/* Loading Skeletons */
.skeleton-wrapper { position:absolute; top:0; left:0; right:0; bottom:0; display:flex; gap:1rem; z-index:50; background:var(--color-surface); align-items:center; justify-content:center;}
.skeleton { background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: skeleton-pulse 1.5s infinite; border-radius: var(--radius-sm); }
@keyframes skeleton-pulse { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Bracket */
.bracket-container { position: relative; overflow-x: auto; padding: 2rem; border-radius: var(--radius-xl); min-height:500px;}
.bracket-grid { display: flex; gap: 4rem; justify-content: space-between; align-items: stretch; min-width: 900px; position:relative; z-index:2; transition: opacity 0.5s ease;}
.bracket-column { display: flex; flex-direction: column; justify-content: space-around; gap: 2rem; flex: 1; }
.bracket-col-title { text-align: center; color: var(--color-text-secondary); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.1em; margin-bottom: 2rem; }
.bracket-match { background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.5rem; position: relative; box-shadow: var(--shadow-sm); z-index:10; }
.bracket-team { display: flex; justify-content: space-between; padding: 0.5rem; border-radius: 4px; font-size: 0.9rem; align-items:center;}
.bracket-team.winner { font-weight: bold; color: var(--color-gold); background: rgba(233, 196, 106, 0.1); }
.bracket-team.loser { opacity: 0.5; }
.bracket-team-score { font-family: var(--font-mono); font-weight: bold; }
.match-meta { text-align: center; font-size: 0.7rem; color: var(--color-text-secondary); margin-top: 0.5rem; border-top: 1px solid var(--color-border); padding-top: 0.25rem; }
.bracket-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
.bracket-line-path { stroke: var(--color-border); stroke-width: 2; fill: none; }

/* Timeline Palmares */
.timeline { position: relative; max-width: 800px; margin: 0 auto; padding: 2rem 0; }
.timeline::before { content: ''; position: absolute; left: 50px; top: 0; bottom: 0; width: 2px; background: var(--color-border); }
.timeline-item { position: relative; margin-bottom: 3rem; padding-left: 100px; opacity:0; transform:translateY(20px); transition: opacity 0.6s, transform 0.6s;}
.timeline-item.visible { opacity:1; transform:translateY(0); }
.timeline-icon { position: absolute; left: 34px; top: 0; width: 34px; height: 34px; background: var(--color-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; box-shadow: 0 0 0 4px var(--color-white); z-index: 2; }
.timeline-content { background: var(--color-white); padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); }

/* Breadcrumbs */
.breadcrumb { font-size: 0.85rem; margin-bottom: 2rem; color: var(--color-text-secondary); }
.breadcrumb a { color: var(--color-primary); font-weight: 500; }
.breadcrumb i { font-size: 0.7rem; margin: 0 0.5rem; opacity: 0.5; }

/* Chart Container */
.chart-container { position:relative; width:100%; height:300px; margin-top:2rem; }

/* Print */
@media print {
  .site-header, .site-footer, .hero-section, #backToTop, .cursor, .cursor-follower { display: none !important; }
  body { background: white; color: black; }
  .bracket-container { overflow: visible; padding: 0; border: none; }
  .bracket-match { border: 1px solid #000; box-shadow: none; break-inside: avoid; }
  .bracket-line-path { stroke: #000 !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
;

if(!css.includes('.bracket-match')) {
    fs.writeFileSync('assets/css/main.css', css + additionalCSS, 'utf8');
}

// Update matches mock
const matchsData = JSON.parse(fs.readFileSync('data/matchs.json', 'utf8'));
const newMatches = [
  { "id": "2024-2025-D01", "edition": "2024-2025", "phase": "demi", "equipe_A": "6e_sciences", "equipe_B": "4e_biochimie", "score_A": 400, "score_B": 350, "vainqueur": "6e_sciences", "date": "2025-05-10" },
  { "id": "2024-2025-D02", "edition": "2024-2025", "phase": "demi", "equipe_A": "5e_lettres", "equipe_B": "6e_biochimie", "score_A": 450, "score_B": 420, "vainqueur": "5e_lettres", "date": "2025-05-11" },
  { "id": "2024-2025-Q01", "edition": "2024-2025", "phase": "quart", "equipe_A": "6e_sciences", "equipe_B": "3e_litteraire", "score_A": 500, "score_B": 200, "vainqueur": "6e_sciences", "date": "2025-05-01" },
  { "id": "2024-2025-Q02", "edition": "2024-2025", "phase": "quart", "equipe_A": "4e_biochimie", "equipe_B": "5e_pedagogie", "score_A": 380, "score_B": 360, "vainqueur": "4e_biochimie", "date": "2025-05-02" },
  { "id": "2024-2025-Q03", "edition": "2024-2025", "phase": "quart", "equipe_A": "5e_lettres", "equipe_B": "4e_commerciale", "score_A": 410, "score_B": 300, "vainqueur": "5e_lettres", "date": "2025-05-03" },
  { "id": "2024-2025-Q04", "edition": "2024-2025", "phase": "quart", "equipe_A": "6e_biochimie", "equipe_B": "6e_pedagogie", "score_A": 430, "score_B": 410, "vainqueur": "6e_biochimie", "date": "2025-05-04" },
  { "id": "2024-2025-H01", "edition": "2024-2025", "phase": "huitieme", "equipe_A": "6e_sciences", "equipe_B": "3e_pedagogie", "score_A": 480, "score_B": 150, "vainqueur": "6e_sciences", "date": "2025-04-20" },
  { "id": "2024-2025-H02", "edition": "2024-2025", "phase": "huitieme", "equipe_A": "3e_litteraire", "equipe_B": "4e_litteraire", "score_A": 300, "score_B": 280, "vainqueur": "3e_litteraire", "date": "2025-04-20" }
];
matchsData.matchs.push(...newMatches);
fs.writeFileSync('data/matchs.json', JSON.stringify(matchsData, null, 2));

// Overwrite Palmares to have Timeline
const palmaresHtml = fs.readFileSync('palmares.html', 'utf8');
const newPalmares = palmaresHtml.replace(/<div id="palmaresList"[^>]*>[\s\S]*?<\/div>/, '<div id="palmaresTimeline" class="timeline">\n<div class="skeleton-wrapper" id="palmaresSkeleton"><div class="skeleton" style="height:300px; width:100%; border-radius:var(--radius-xl);"></div></div>\n</div>');
fs.writeFileSync('palmares.html', newPalmares, 'utf8');

// Overwrite Statistiques to have Chart Container
const statHtml = fs.readFileSync('statistiques.html', 'utf8');
const newStat = statHtml.replace('</main>', 
    <div class="card fade-up" style="margin-bottom:3rem;">
      <h3 style="margin-bottom:1rem; text-align:center;">Évolution des Scores</h3>
      <div class="chart-container">
         <canvas id="scoresChart"></canvas>
      </div>
    </div>
  </div>
</main>
);
fs.writeFileSync('statistiques.html', newStat, 'utf8');

