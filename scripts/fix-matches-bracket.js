const fs = require('fs');

const m = JSON.parse(fs.readFileSync('data/matchs.json', 'utf8'));

// Only add if not present
if (!m.matchs.find(x => x.id === '2024-2025-H01')) {
    m.matchs.push(
      {
        "id": "2024-2025-H01",
        "edition": "2024-2025",
        "phase": "huitieme",
        "equipe_A": "6e_sciences",
        "equipe_B": "3e_pedagogie",
        "score_A": 680,
        "score_B": 350,
        "vainqueur": "6e_sciences",
        "date": "2025-04-20",
        "score_par_manche": {
            "culture_generale": { "A": 180, "B": 100 },
            "math_individuel": { "A": 150, "B": 80 },
            "sciences": { "A": 200, "B": 100 },
            "francais": { "A": 150, "B": 70 },
            "non_repondues": 20
        }
      },
      {
        "id": "2024-2025-Q01",
        "edition": "2024-2025",
        "phase": "quart",
        "equipe_A": "6e_sciences",
        "equipe_B": "4e_biochimie",
        "score_A": 550,
        "score_B": 480,
        "vainqueur": "6e_sciences",
        "date": "2025-05-01",
        "score_par_manche": {
            "culture_generale": { "A": 140, "B": 120 },
            "math_individuel": { "A": 110, "B": 100 },
            "sciences": { "A": 160, "B": 150 },
            "francais": { "A": 140, "B": 110 },
            "non_repondues": 20
        }
      },
      {
        "id": "2024-2025-D02",
        "edition": "2024-2025",
        "phase": "demi",
        "equipe_A": "5e_lettres",
        "equipe_B": "6e_biochimie",
        "score_A": 520,
        "score_B": 490,
        "vainqueur": "5e_lettres",
        "date": "2025-05-11",
        "score_par_manche": {
            "culture_generale": { "A": 130, "B": 120 },
            "math_individuel": { "A": 100, "B": 110 },
            "sciences": { "A": 140, "B": 150 },
            "francais": { "A": 150, "B": 110 },
            "non_repondues": 40
        }
      }
    );
    fs.writeFileSync('data/matchs.json', JSON.stringify(m, null, 2));
}

