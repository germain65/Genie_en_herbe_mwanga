const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/matchs.json', 'utf8'));

// Update scores to be near 1050 total
data.matchs.forEach(m => {
    if (m.phase === 'huitieme' || m.phase === 'quart' || m.phase === 'demi') {
        const total = m.score_A + m.score_B;
        if (total < 900) {
            // scale them up to sum around 1000-1050
            m.score_A = m.score_A + 200;
            m.score_B = m.score_B + 200;
        }
    }
});

// ensure there is a finale match, wait user asked for 3 matches. Let's add a finale match.
if (!data.matchs.find(m => m.phase === 'finale' && m.id.startsWith('2024-2025-F'))) {
   data.matchs.push({
      "id": "2024-2025-F01", "edition": "2024-2025", "phase": "finale", 
      "equipe_A": "6e_sciences", "equipe_B": "5e_lettres", 
      "score_A": 540, "score_B": 510, "vainqueur": "6e_sciences", 
      "date": "2025-05-15"
   });
}

fs.writeFileSync('data/matchs.json', JSON.stringify(data, null, 2));
