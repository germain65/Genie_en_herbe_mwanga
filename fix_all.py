#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEH Mwanga — Master Fix Script
Applies ALL required corrections in one pass.
"""
import os, re, json
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
TODAY = date.today().isoformat()

HTML_FILES = [
    '404.html','archives.html','bracket.html','classement.html',
    'contact.html','edition.html','equipe.html','index.html',
    'match.html','palmares.html','presentation.html','reglement.html',
    'statistiques.html'
]

# ─── Cursor HTML block ────────────────────────────────────────────────────────
CURSOR_HTML = '<div class="cursor" id="cursor"></div>\n<div class="cursor-follower" id="cursor-follower"></div>\n'

# ─── Preload link ─────────────────────────────────────────────────────────────
PRELOAD_LINK = '  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Syne:wght@600;700;800&display=swap" as="style" onload="this.rel=\'stylesheet\'">\n'

# ─── Noscript ─────────────────────────────────────────────────────────────────
NOSCRIPT = '<noscript><p>Activez JavaScript pour accéder au site complet.</p></noscript>\n'

# ─── Theme-color ──────────────────────────────────────────────────────────────
THEME_COLOR = '  <meta name="theme-color" content="#1A3A6B">\n'

def process_html(filename):
    path = os.path.join(BASE, filename)
    if not os.path.exists(path):
        print(f'  [SKIP] {filename} — not found')
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    slug = filename.replace('.html','')
    canonical_url = f'https://geh-imgoma.github.io/{filename}'

    # 1. noscript inside <head> (first child after <head>)
    if '<noscript>' not in content:
        content = content.replace('<head>\n', '<head>\n' + NOSCRIPT, 1)
        content = content.replace('<head>\r\n', '<head>\r\n' + NOSCRIPT.replace('\n','\r\n'), 1)

    # 2. theme-color
    if 'theme-color' not in content:
        content = content.replace('</head>', THEME_COLOR + '</head>', 1)

    # 3. canonical
    if 'canonical' not in content:
        canon = f'  <link rel="canonical" href="{canonical_url}">\n'
        content = content.replace('</head>', canon + '</head>', 1)

    # 4. preload fonts
    if 'preload' not in content:
        content = content.replace('</head>', PRELOAD_LINK + '</head>', 1)

    # 5. display=swap on Google Fonts import in HTML (not in CSS)
    content = re.sub(
        r'(fonts\.googleapis\.com/css2\?[^"\']+)(?<!display=swap)',
        lambda m: m.group(0) if 'display=swap' in m.group(0) else m.group(0) + ('&display=swap' if '?' in m.group(0) else '?display=swap'),
        content
    )

    # 6. cursor divs — must be FIRST inside <body>
    # Remove existing cursor divs anywhere
    content = re.sub(r'<div class="cursor" id="cursor"[^>]*></div>\s*\n?', '', content)
    content = re.sub(r'<div class="cursor-follower" id="cursor-follower"[^>]*></div>\s*\n?', '', content)
    # Now inject at very start of <body>
    content = re.sub(r'(<body[^>]*>)', r'\1\n' + CURSOR_HTML, content, count=1)

    # 7. all target="_blank" must have rel="noopener noreferrer"
    def fix_blank(m):
        tag = m.group(0)
        if 'noopener' not in tag:
            if 'rel=' in tag:
                tag = re.sub(r'rel="([^"]*)"', r'rel="\1 noopener noreferrer"', tag)
            else:
                tag = tag.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
        return tag
    content = re.sub(r'<a [^>]*target="_blank"[^>]*>', fix_blank, content)

    # 8. img tags: add loading="lazy" if missing (skip hero images that should be eager)
    def fix_img(m):
        tag = m.group(0)
        if 'loading=' not in tag:
            tag = tag.replace('<img ', '<img loading="lazy" ')
        return tag
    content = re.sub(r'<img [^>]+>', fix_img, content)

    # 9. classement-joueurs link in nav (only in pages with nav)
    if 'classement-joueurs.html' not in content and '<nav class="main-nav"' in content:
        content = content.replace(
            '<a href="classement.html"',
            '<a href="classement-joueurs.html"><i class="ph-bold ph-user-list" aria-hidden="true"></i> Joueurs</a>\n      <a href="classement.html"',
            1
        )

    # 10. classement-joueurs link in footer nav
    if 'classement-joueurs.html' not in content and 'Classement</a>' in content:
        content = content.replace(
            '<li><a href="classement.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Classement</a></li>',
            '<li><a href="classement.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Classement</a></li>\n          <li><a href="classement-joueurs.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Joueurs</a></li>',
            1
        )

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  [OK]   {filename}')
    else:
        print(f'  [=]    {filename} (no change needed)')

# ─── Fix main.css ─────────────────────────────────────────────────────────────
def fix_css():
    path = os.path.join(BASE, 'assets', 'css', 'main.css')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Ensure display=swap on fonts import
    content = content.replace(
        "family=Syne:wght@600;700;800')",
        "family=Syne:wght@600;700;800&display=swap')"
    )
    content = re.sub(
        r"(fonts\.googleapis\.com/css2\?[^')]+)(?<!display=swap)(['\)])",
        lambda m: m.group(0) if 'display=swap' in m.group(0) else m.group(1) + '&display=swap' + m.group(2),
        content
    )

    # Ensure cursor uses ID selectors with correct z-index
    if '#cursor {' not in content:
        # Replace .cursor with #cursor rules
        content = content.replace('.cursor {', '#cursor {\n  will-change: left, top;')
        content = content.replace('.cursor-follower {', '#cursor-follower {\n  will-change: left, top;')

    # Ensure z-index is max
    content = re.sub(r'(#cursor\s*\{[^}]*)z-index:\s*\d+', r'\g<1>z-index: 2147483647', content)
    content = re.sub(r'(#cursor-follower\s*\{[^}]*)z-index:\s*\d+', r'\g<1>z-index: 2147483646', content)

    # Add hover states for cursor if missing
    if '#cursor.hover' not in content:
        content += """
/* Cursor hover states */
#cursor.hover {
  width: 18px;
  height: 18px;
  background: var(--color-accent-red);
}
#cursor-follower.hover {
  width: 50px;
  height: 50px;
  border-color: var(--color-gold);
  opacity: 0.4;
}
/* Native cursor on form inputs */
input, textarea, select {
  cursor: text !important;
}
/* Focus visible */
:focus-visible {
  outline: 3px solid var(--color-gold) !important;
  outline-offset: 3px !important;
}
"""

    # Replace .cursor with #cursor selectors (CSS)
    content = re.sub(r'(?<!\w)\.cursor(?!-follower)(?!\w)', '#cursor', content)
    content = re.sub(r'(?<!\w)\.cursor-follower(?!\w)', '#cursor-follower', content)

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('  [OK]   assets/css/main.css')
    else:
        print('  [=]    assets/css/main.css (no change needed)')

# ─── Fix app.js ───────────────────────────────────────────────────────────────
def fix_appjs():
    path = os.path.join(BASE, 'assets', 'js', 'app.js')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Replace old initCursor with the definitive RAF-based version
    new_cursor = """  initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      requestAnimationFrame(animateFollower);
    };
    animateFollower();

    document.querySelectorAll('a, button, .card, input, textarea, select, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '0.7';
    });
  },"""

    # Replace old initCursor block
    content = re.sub(
        r'  initCursor\(\)\s*\{.*?\n  \},',
        new_cursor,
        content,
        flags=re.DOTALL
    )

    # Add classement-joueurs route
    if 'classement-joueurs.html' not in content:
        content = content.replace(
            "} else if (path.includes('classement.html')) {",
            "} else if (path.includes('classement-joueurs.html')) {\n        this.renderClassementJoueurs();\n      } else if (path.includes('classement.html')) {"
        )

    # Add renderClassementJoueurs method before closing brace
    if 'renderClassementJoueurs' not in content:
        joueurs_method = """
  renderClassementJoueurs() {
    // Build flat player list from all equipes
    const allJoueurs = [];
    this.equipes.forEach(eq => {
      (eq.joueurs || []).forEach(j => {
        allJoueurs.push({ ...j, equipe: eq });
      });
    });

    allJoueurs.sort((a, b) => (b.stats?.points_totaux || 0) - (a.stats?.points_totaux || 0));

    // Top 3 podium
    const podium = document.getElementById('joueursPodium');
    if (podium) {
      const medals = ['🥇','🥈','🥉'];
      podium.innerHTML = allJoueurs.slice(0, 3).map((j, i) => `
        <div class="card fade-up" style="text-align:center; transition-delay:${i*0.1}s; position:relative; ${i===0?'border: 2px solid var(--color-gold);':''}">
          ${i===0 ? '<span class="badge badge-gold" style="position:absolute;top:1rem;right:1rem;"><i class="ph-fill ph-crown" style="color:var(--color-gold);"></i> MVP</span>' : ''}
          <div style="font-size:3rem; margin-bottom:0.5rem;">${medals[i]}</div>
          <i class="ph-duotone ph-user-circle" style="font-size:4rem; color:var(--color-primary); margin-bottom:1rem; display:block;" aria-hidden="true"></i>
          <h3 style="margin-bottom:0.25rem;">${j.prenom} ${j.nom}</h3>
          <p style="color:var(--color-text-secondary); margin-bottom:0.5rem;">${j.classe || j.equipe?.nom_court || ''}</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:1rem;">
            <div style="background:var(--color-surface); padding:0.5rem; border-radius:var(--radius-sm);">
              <div style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800; color:var(--color-primary);">${j.stats?.points_totaux || 0}</div>
              <div style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">Points</div>
            </div>
            <div style="background:var(--color-surface); padding:0.5rem; border-radius:var(--radius-sm);">
              <div style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800; color:var(--color-primary);">${j.stats?.moyenne_par_match || 0}</div>
              <div style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">Moy/match</div>
            </div>
          </div>
          <div style="margin-top:0.75rem;">
            <span class="badge badge-blue">${j.stats?.specialite || '-'}</span>
          </div>
        </div>
      `).join('');
    }

    // Filter selects
    const selectSpec = document.getElementById('filterSpecialite');
    const selectEd   = document.getElementById('filterEdition');
    if (selectSpec && allJoueurs.length) {
      const specs = [...new Set(allJoueurs.map(j => j.stats?.specialite).filter(Boolean))];
      specs.forEach(s => { const o = new Option(s, s); selectSpec.add(o); });
    }
    if (selectEd) {
      this.editions.forEach(ed => { const o = new Option('Édition ' + ed.id, ed.id); selectEd.add(o); });
    }

    const renderTable = (joueurs) => {
      const tb = document.getElementById('joueursTableBody');
      if (!tb) return;
      tb.innerHTML = joueurs.map((j, i) => {
        const formeData = j.stats?.forme || [];
        const forme = Array.from({length:5}, (_, k) => {
          const r = formeData[k];
          const color = r === 'V' ? 'var(--color-accent-green)' : r === 'D' ? 'var(--color-accent-red)' : 'var(--color-border)';
          return `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin:0 2px;" title="${r||'?'}"></span>`;
        }).join('');

        const medalIcon = i === 0
          ? '<i class="ph-fill ph-medal" style="color:#FFD700;font-size:1.2rem;"></i>'
          : i === 1
          ? '<i class="ph-fill ph-medal" style="color:#C0C0C0;font-size:1.2rem;"></i>'
          : i === 2
          ? '<i class="ph-fill ph-medal" style="color:#CD7F32;font-size:1.2rem;"></i>'
          : `<span style="font-family:var(--font-heading);font-weight:800;">${i+1}</span>`;

        return `<tr class="fade-up" style="transition-delay:${i*0.03}s">
          <td class="text-center">${medalIcon}</td>
          <td><i class="ph-duotone ph-user-circle" style="font-size:2rem;vertical-align:middle;color:var(--color-primary);margin-right:0.5rem;" aria-hidden="true"></i></td>
          <td><strong>${j.prenom} ${j.nom}</strong></td>
          <td>${j.classe || j.equipe?.nom_court || '-'}</td>
          <td class="score-td">${j.stats?.matchs_joues || 0}</td>
          <td class="score-td main-score">${j.stats?.points_totaux || 0}</td>
          <td class="score-td">${j.stats?.moyenne_par_match || 0}</td>
          <td class="score-td" style="color:var(--color-accent-green);">${j.stats?.meilleure_performance || 0}</td>
          <td><span class="badge badge-blue">${j.stats?.specialite || '-'}</span></td>
          <td>${forme}</td>
        </tr>`;
      }).join('');
    };

    renderTable(allJoueurs);

    const filterAndRender = () => {
      let filtered = [...allJoueurs];
      const spec = selectSpec ? selectSpec.value : '';
      if (spec) filtered = filtered.filter(j => j.stats?.specialite === spec);
      if (filtered.length === 0) {
        const tb = document.getElementById('joueursTableBody');
        if (tb) tb.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;">Aucun joueur trouvé.</td></tr>';
      } else {
        renderTable(filtered);
      }
    };

    if (selectSpec) selectSpec.addEventListener('change', filterAndRender);
    if (selectEd) selectEd.addEventListener('change', filterAndRender);

    this.makeTableSortable('joueursTable');
    this.initAnimations();
  },

"""
        content = content.replace('\n};\n\ndocument.addEventListener', '\n' + joueurs_method + '};\n\ndocument.addEventListener')

    # Ensure fetch has .catch in loadData (already has it via Promise.all catches)
    # Add explicit catch to each individual fetch in case someone calls fetchData alone
    if "console.error('Erreur fetch:" not in content:
        content = content.replace(
            "const fetchData = async (file) => {\n      const response = await fetch(`${basePath}/data/${file}`);\n      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);\n      return await response.json();\n    };",
            """const fetchData = async (file) => {
      const response = await fetch(`${basePath}/data/${file}`).catch(err => {
        console.error('Erreur fetch:', file, err);
        const errDiv = document.getElementById('fetch-error') || (() => {
          const d = document.createElement('div');
          d.id = 'fetch-error';
          d.style.cssText = 'position:fixed;bottom:20px;left:20px;background:#cc1f2d;color:#fff;padding:1rem;border-radius:8px;z-index:9999999;max-width:360px;';
          document.body.appendChild(d); return d;
        })();
        errDiv.innerHTML = '<strong>Erreur réseau :</strong> Impossible de charger <em>' + file + '</em>. Vérifiez votre connexion.';
        throw err;
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    };"""
        )

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('  [OK]   assets/js/app.js')
    else:
        print('  [=]    assets/js/app.js (no change needed)')

# ─── Update equipes.json with joueurs data ────────────────────────────────────
def fix_equipes_json():
    path = os.path.join(BASE, 'data', 'equipes.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    JOUEURS_TEMPLATES = {
        '6e_sciences': [
            {"id":"joueur_001","nom":"Ngoma","prenom":"Elie","classe":"6e Sciences","photo":"assets/images/avatars/joueur_001.jpg",
             "stats":{"matchs_joues":8,"points_totaux":1240,"moyenne_par_match":155,"meilleure_performance":210,"victoires":6,"specialite":"Sciences","forme":["V","V","D","V","V"]}},
            {"id":"joueur_002","nom":"Bahati","prenom":"Rachel","classe":"6e Sciences","photo":"assets/images/avatars/joueur_002.jpg",
             "stats":{"matchs_joues":7,"points_totaux":980,"moyenne_par_match":140,"meilleure_performance":195,"victoires":5,"specialite":"Mathématiques","forme":["V","D","V","V","D"]}},
            {"id":"joueur_003","nom":"Kasereka","prenom":"John","classe":"6e Sciences","photo":"assets/images/avatars/joueur_003.jpg",
             "stats":{"matchs_joues":8,"points_totaux":870,"moyenne_par_match":108,"meilleure_performance":180,"victoires":5,"specialite":"Physique","forme":["D","V","V","D","V"]}}
        ],
        '5e_lettres': [
            {"id":"joueur_004","nom":"Kahindo","prenom":"Jeanne","classe":"5e Lettres","photo":"assets/images/avatars/joueur_004.jpg",
             "stats":{"matchs_joues":8,"points_totaux":1150,"moyenne_par_match":143,"meilleure_performance":200,"victoires":5,"specialite":"Littérature","forme":["V","V","V","D","V"]}},
            {"id":"joueur_005","nom":"Masika","prenom":"Grace","classe":"5e Lettres","photo":"assets/images/avatars/joueur_005.jpg",
             "stats":{"matchs_joues":7,"points_totaux":910,"moyenne_par_match":130,"meilleure_performance":175,"victoires":4,"specialite":"Histoire","forme":["D","V","D","V","V"]}},
            {"id":"joueur_006","nom":"Bulambo","prenom":"Patrick","classe":"5e Lettres","photo":"assets/images/avatars/joueur_006.jpg",
             "stats":{"matchs_joues":8,"points_totaux":800,"moyenne_par_match":100,"meilleure_performance":165,"victoires":4,"specialite":"Géographie","forme":["V","D","V","D","D"]}}
        ],
        '6e_biochimie': [
            {"id":"joueur_007","nom":"Mutombo","prenom":"Marc","classe":"6e Bio-Chimie","photo":"assets/images/avatars/joueur_007.jpg",
             "stats":{"matchs_joues":8,"points_totaux":1090,"moyenne_par_match":136,"meilleure_performance":190,"victoires":5,"specialite":"Chimie","forme":["V","V","D","V","D"]}},
            {"id":"joueur_008","nom":"Byamungu","prenom":"Solange","classe":"6e Bio-Chimie","photo":"assets/images/avatars/joueur_008.jpg",
             "stats":{"matchs_joues":7,"points_totaux":850,"moyenne_par_match":121,"meilleure_performance":170,"victoires":4,"specialite":"Biologie","forme":["D","V","V","V","D"]}},
            {"id":"joueur_009","nom":"Bauma","prenom":"Victor","classe":"6e Bio-Chimie","photo":"assets/images/avatars/joueur_009.jpg",
             "stats":{"matchs_joues":8,"points_totaux":760,"moyenne_par_match":95,"meilleure_performance":155,"victoires":3,"specialite":"Sciences","forme":["D","D","V","D","V"]}}
        ]
    }

    changed = False
    for eq in data['equipes']:
        if not eq.get('joueurs'):
            eq['joueurs'] = JOUEURS_TEMPLATES.get(eq['id'], [])
            changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print('  [OK]   data/equipes.json')
    else:
        print('  [=]    data/equipes.json (no change needed)')

# ─── Create classement-joueurs.html ───────────────────────────────────────────
def create_classement_joueurs():
    path = os.path.join(BASE, 'classement-joueurs.html')
    content = '''<!DOCTYPE html>
<html lang="fr">
<head>
<noscript><p>Activez JavaScript pour accéder au site complet.</p></noscript>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Classement des Joueurs — GEH IMGoma</title>
  <meta name="description" content="Classement individuel de tous les joueurs du Championnat de Génies en Herbe de l'Institut Mwanga.">
  <meta property="og:title" content="Classement des Joueurs — GEH IMGoma">
  <meta property="og:description" content="Classement individuel de tous les joueurs.">
  <meta property="og:image" content="https://geh-imgoma.github.io/assets/images/og-default.jpg">
  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
  <meta name="theme-color" content="#1A3A6B">
  <link rel="canonical" href="https://geh-imgoma.github.io/classement-joueurs.html">
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Syne:wght@600;700;800&display=swap" as="style" onload="this.rel=\'stylesheet\'">
  <script src="https://unpkg.com/@phosphor-icons/web" defer></script>
  <link rel="stylesheet" href="assets/css/main.css">
  <script>window.GEH_BASE = '.';</script>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-follower" id="cursor-follower"></div>

<header class="site-header" role="banner">
  <div class="container"><div class="header-inner" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
    <a href="index.html" class="header-brand">
      <div class="header-logo"><i class="ph-duotone ph-graduation-cap" aria-hidden="true"></i></div>
      <div class="header-title"><strong>GEH Mwanga</strong><span>Institut Mwanga de Goma · RDC</span></div>
    </a>
    <nav class="main-nav" id="mainNav">
      <a href="index.html"><i class="ph-bold ph-house" aria-hidden="true"></i> Accueil</a>
      <a href="classement-joueurs.html" class="active"><i class="ph-bold ph-user-list" aria-hidden="true"></i> Joueurs</a>
      <a href="classement.html"><i class="ph-bold ph-list-numbers" aria-hidden="true"></i> Classement</a>
      <a href="archives.html"><i class="ph-bold ph-clock-counter-clockwise" aria-hidden="true"></i> Archives</a>
      <span class="nav-edition-badge">...</span>
    </nav>
  </div></div>
</header>

<div class="page-hero">
  <div class="container">
    <span class="page-hero-eyebrow"><i class="ph-fill ph-crown" style="color:var(--color-gold);"></i> Palmarès Individuel</span>
    <h1>Classement des Joueurs</h1>
    <p>Performances individuelles de tous les participants du Championnat.</p>
  </div>
</div>

<main>
  <section class="section" style="padding-top:2rem;">
    <div class="container">

      <!-- Filtres -->
      <div class="fade-up" style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:3rem; align-items:center;">
        <label for="filterEdition" style="font-weight:600; color:var(--color-text-secondary);">
          <i class="ph-bold ph-funnel" aria-hidden="true"></i> Filtrer :
        </label>
        <select id="filterEdition" class="btn btn-outline btn-dark" style="padding:0.6rem 1.2rem; border-radius:var(--radius-sm); font-size:0.95rem; background:white; color:var(--color-primary);">
          <option value="">Toutes les éditions</option>
        </select>
        <select id="filterSpecialite" class="btn btn-outline btn-dark" style="padding:0.6rem 1.2rem; border-radius:var(--radius-sm); font-size:0.95rem; background:white; color:var(--color-primary);">
          <option value="">Toutes les spécialités</option>
        </select>
      </div>

      <!-- Top 3 Podium -->
      <div class="fade-up" style="margin-bottom:4rem;">
        <span class="section-label">Hall of Fame</span>
        <h2 style="margin-bottom:2rem;">Top 3 — MVP du Championnat</h2>
        <div class="grid-cards" id="joueursPodium">
          <p style="text-align:center;"><i class="ph-bold ph-spinner-gap ph-spin" aria-hidden="true"></i> Chargement...</p>
        </div>
      </div>

      <!-- Tableau complet -->
      <div class="fade-up">
        <span class="section-label">Classement Général</span>
        <h2 style="margin-bottom:2rem;">Tous les Joueurs</h2>
        <div class="table-responsive">
          <table id="joueursTable">
            <thead>
              <tr>
                <th data-dir="asc" style="width:50px;" class="text-center">Rang</th>
                <th style="width:50px;">Photo</th>
                <th data-dir="asc">Nom</th>
                <th data-dir="asc">Classe</th>
                <th data-dir="asc" title="Matchs Joués">MJ <i class="ph-bold ph-caret-up-down" aria-hidden="true"></i></th>
                <th data-dir="asc" title="Points Totaux">Points <i class="ph-bold ph-caret-up-down" aria-hidden="true"></i></th>
                <th data-dir="asc" title="Moyenne par match">Moy/match <i class="ph-bold ph-caret-up-down" aria-hidden="true"></i></th>
                <th data-dir="asc" title="Meilleure performance">Meilleure perf. <i class="ph-bold ph-caret-up-down" aria-hidden="true"></i></th>
                <th data-dir="asc">Spécialité</th>
                <th>Forme <small style="opacity:0.6;">(5 derniers)</small></th>
              </tr>
            </thead>
            <tbody id="joueursTableBody">
              <tr><td colspan="10" style="text-align:center;padding:3rem;">
                <i class="ph-bold ph-spinner-gap ph-spin" aria-hidden="true"></i> Calcul en cours...
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </section>
</main>

<footer class="site-footer" role="contentinfo">
  <div class="footer-bg-pattern"></div>
  <div class="footer-tricolor"></div>
  <div class="container footer-inner">
    <div class="footer-grid">
      <div class="footer-brand"><div class="brand-logo"><div class="footer-logo-circle"><i class="ph-duotone ph-graduation-cap" aria-hidden="true"></i></div><strong>Institut Mwanga de Goma</strong></div><p style="color:rgba(255,255,255,0.6); font-size:0.9rem;">Site officiel du Championnat de Génies en Herbe.</p></div>
      <div class="footer-col"><h4>Navigation</h4>
        <ul>
          <li><a href="index.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Accueil</a></li>
          <li><a href="classement-joueurs.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Joueurs</a></li>
          <li><a href="classement.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Classement</a></li>
          <li><a href="bracket.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Tableau (Bracket)</a></li>
          <li><a href="palmares.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Palmarès</a></li>
        </ul>
      </div>
      <div class="footer-col"><h4>Archives</h4>
        <ul id="footerArchivesList">
          <li><i class="ph-bold ph-spinner-gap ph-spin" aria-hidden="true"></i> Chargement...</li>
        </ul>
      </div>
      <div class="footer-col"><h4>Ressources</h4>
        <ul>
          <li><a href="statistiques.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Statistiques</a></li>
          <li><a href="reglement.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Règlement</a></li>
          <li><a href="contact.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom"><p>© <span id="footerYear"></span> GEH Mwanga — Institut Mwanga de Goma.</p></div>
  </div>
</footer>

<button id="backToTop" class="btn btn-primary" aria-label="Retour en haut de page"><i class="ph-bold ph-arrow-up" aria-hidden="true"></i></button>
<script src="assets/js/app.js"></script>
</body>
</html>
'''
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('  [OK]   classement-joueurs.html (CREATED)')

# ─── Update sitemap.xml ───────────────────────────────────────────────────────
def fix_sitemap():
    path = os.path.join(BASE, 'sitemap.xml')
    pages = [
        ('index.html', '1.0'),
        ('classement.html', '0.9'),
        ('classement-joueurs.html', '0.9'),
        ('archives.html', '0.8'),
        ('bracket.html', '0.8'),
        ('palmares.html', '0.8'),
        ('statistiques.html', '0.7'),
        ('presentation.html', '0.7'),
        ('reglement.html', '0.6'),
        ('contact.html', '0.6'),
    ]
    urls = '\n'.join(
        f'  <url>\n    <loc>https://geh-imgoma.github.io/{p}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{prio}</priority>\n  </url>'
        for p, prio in pages
    )
    content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>
'''
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('  [OK]   sitemap.xml')

# ─── Update robots.txt ────────────────────────────────────────────────────────
def fix_robots():
    path = os.path.join(BASE, 'robots.txt')
    content = '''User-agent: *
Allow: /
Disallow: /404.html
Sitemap: https://geh-imgoma.github.io/sitemap.xml
'''
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('  [OK]   robots.txt')

# ─── Create avatars dir ───────────────────────────────────────────────────────
def ensure_avatars_dir():
    d = os.path.join(BASE, 'assets', 'images', 'avatars')
    os.makedirs(d, exist_ok=True)
    print(f'  [OK]   assets/images/avatars/ directory ensured')

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('\n=== GEH Mwanga Master Fix ===\n')

    print('[1] Processing HTML files...')
    for f in HTML_FILES:
        process_html(f)

    print('\n[2] Fixing CSS...')
    fix_css()

    print('\n[3] Fixing app.js...')
    fix_appjs()

    print('\n[4] Updating equipes.json...')
    fix_equipes_json()

    print('\n[5] Creating classement-joueurs.html...')
    create_classement_joueurs()

    print('\n[6] Updating sitemap.xml...')
    fix_sitemap()

    print('\n[7] Fixing robots.txt...')
    fix_robots()

    print('\n[8] Ensuring avatars directory...')
    ensure_avatars_dir()

    print('\n=== Done. Running verification checks... ===\n')
