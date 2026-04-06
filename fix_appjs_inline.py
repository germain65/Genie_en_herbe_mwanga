#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix: move renderClassementJoueurs inside the GEH object."""

with open('assets/js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if the method is already properly inside the GEH object
outside_marker = 'renderClassementJoueurs'
geh_close_marker = '\n};\n'
dom_marker = "document.addEventListener('DOMContentLoaded'"

geh_close_pos = content.rfind(geh_close_marker)
outside_pos = content.find(outside_marker)
dom_pos = content.find(dom_marker)

print(f'renderClassementJoueurs found at: {outside_pos}')
print(f'Last GEH }}; at: {geh_close_pos}')
print(f'DOMContentLoaded at: {dom_pos}')
print(f'Method is OUTSIDE GEH object: {outside_pos > geh_close_pos}')

JOUEURS_METHOD = '''
  renderClassementJoueurs() {
    const allJoueurs = [];
    this.equipes.forEach(eq => {
      (eq.joueurs || []).forEach(j => {
        allJoueurs.push({ ...j, equipe: eq });
      });
    });
    allJoueurs.sort((a, b) => (b.stats?.points_totaux || 0) - (a.stats?.points_totaux || 0));

    const podium = document.getElementById('joueursPodium');
    if (podium) {
      const medals = ['\u{1F947}','\u{1F948}','\u{1F949}'];
      podium.innerHTML = allJoueurs.slice(0, 3).map((j, i) => `
        <div class="card fade-up" style="text-align:center; transition-delay:${i*0.1}s; position:relative; ${i===0?'border: 2px solid var(--color-gold);':''}">
          ${i===0 ? '<span class="badge badge-gold" style="position:absolute;top:1rem;right:1rem;"><i class=\\"ph-fill ph-crown\\" style=\\"color:var(--color-gold);\\"></i> MVP</span>' : ''}
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
          <div style="margin-top:0.75rem;"><span class="badge badge-blue">${j.stats?.specialite || '-'}</span></div>
        </div>
      `).join('');
    }

    const selectSpec = document.getElementById('filterSpecialite');
    const selectEd   = document.getElementById('filterEdition');
    if (selectSpec && allJoueurs.length) {
      const specs = [...new Set(allJoueurs.map(j => j.stats?.specialite).filter(Boolean))];
      specs.forEach(s => selectSpec.add(new Option(s, s)));
    }
    if (selectEd) {
      this.editions.forEach(ed => selectEd.add(new Option('Edition ' + ed.id, ed.id)));
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
        const medal = i===0 ? '<i class=\\"ph-fill ph-medal\\" style=\\"color:#FFD700;font-size:1.2rem;\\"></i>'
          : i===1 ? '<i class=\\"ph-fill ph-medal\\" style=\\"color:#C0C0C0;font-size:1.2rem;\\"></i>'
          : i===2 ? '<i class=\\"ph-fill ph-medal\\" style=\\"color:#CD7F32;font-size:1.2rem;\\"></i>'
          : `<span style=\\"font-family:var(--font-heading);font-weight:800;\\">${i+1}</span>`;
        return `<tr class="fade-up" style="transition-delay:${i*0.03}s">
          <td class="text-center">${medal}</td>
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
      if (!filtered.length) {
        const tb = document.getElementById('joueursTableBody');
        if (tb) tb.innerHTML = '<tr><td colspan=\\"10\\" style=\\"text-align:center;padding:2rem;\\">Aucun joueur trouve.</td></tr>';
      } else renderTable(filtered);
    };

    if (selectSpec) selectSpec.addEventListener('change', filterAndRender);
    if (selectEd)   selectEd.addEventListener('change', filterAndRender);
    this.makeTableSortable('joueursTable');
    this.initAnimations();
  },
'''

# Strategy: remove the method if it exists outside GEH (after }; ), then
# insert it properly inside GEH before the closing brace.

# First, strip any orphaned copy that might exist after the GEH closing };
# The GEH object closes at the LAST occurrence of '\n};\n'
# Everything after that should only be the DOMContentLoaded call.

# Find where GEH object ends - the last `\n};\n` before DOMContentLoaded
split_marker = '\n};\n\ndocument.addEventListener'
split_pos = content.find(split_marker)
if split_pos == -1:
    # try without double newline
    split_marker = '\n};\ndocument.addEventListener'
    split_pos = content.find(split_marker)

print(f'Split marker found at: {split_pos}')

if split_pos == -1:
    print('ERROR: Could not find GEH object closing pattern!')
    exit(1)

geh_body = content[:split_pos]
rest = content[split_pos:]

# Remove any orphaned renderClassementJoueurs outside GEH
# (it would appear in `rest` if injected wrongly)
if 'renderClassementJoueurs' in rest:
    import re
    rest = re.sub(r'\s*renderClassementJoueurs\(\)\s*\{.*?\n\s*\},?\s*', '', rest, flags=re.DOTALL)
    print('Removed orphaned renderClassementJoueurs from outside GEH')

# Check if method already exists inside GEH body
if 'renderClassementJoueurs' in geh_body:
    print('renderClassementJoueurs already inside GEH — no change needed')
else:
    # Find last method closing in GEH body: the renderClassementGeneral closing
    # Last `\n  }` before end of geh_body
    last_method_end = geh_body.rfind('\n  }')
    if last_method_end == -1:
        print('ERROR: Could not find last method closing in GEH body!')
        exit(1)

    # Replace that last `  }` with `  },\n  renderClassementJoueurs...  }`
    geh_body = (
        geh_body[:last_method_end]
        + '\n  },'
        + JOUEURS_METHOD
    )
    print('Injected renderClassementJoueurs inside GEH object')

new_content = geh_body + rest

with open('assets/js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('app.js saved successfully')
print(f'Total lines: {new_content.count(chr(10))}')
