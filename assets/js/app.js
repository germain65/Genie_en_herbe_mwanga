/**
 * Core Application Logic for GEH Mwanga - 2026 Edition
 */

const GEH = {
  config: null,
  editions: [],
  equipes: [],
  matchs: [],

  async init() {
    this.initCursor();
    this.initHamburger();
    this.initPageTransitions();

    try {
      await this.loadData();
      this.setupNavigation();
      this.renderCommonElements();
      this.renderBreadcrumbs();
      this.initBackToTop();

      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');

      if (path.includes('edition.html')) {
        if (id) this.renderEditionDetails(id);
        else window.location.replace('index.html');
      } else if (path.includes('match.html')) {
        if (id) this.renderMatchDetails(id);
        else window.location.replace('index.html');
      } else if (path.includes('equipe.html')) {
        if (id) this.renderEquipeDetails(id);
        else window.location.replace('index.html');
      } else if (path.includes('classement-joueurs.html')) {
        this.renderClassementJoueurs();
      } else if (path.includes('classement.html')) {
        this.renderClassementGeneral();
      } else if (path.includes('archives.html')) {
        this.renderArchives();
      } else if (path.includes('bracket.html')) {
        this.renderBracket();
        window.addEventListener('resize', () => this.drawBracketLines());
      } else if (path.includes('palmares.html')) {
        this.renderTimeline();
      } else if (path.includes('statistiques.html')) {
        setTimeout(() => this.renderCharts(), 500);
      } else if (path.includes('index.html') || path === '/' || path === '') {
        this.renderHomepage();
      }

      this.initAnimations();

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      document.body.innerHTML += '<div style="position:fixed; bottom:20px; right:20px; background:#cc1f2d; color:#fff; padding:1rem; border-radius:8px; z-index:999999; box-shadow:0 4px 12px rgba(0,0,0,0.3);"><strong>Erreur de connexion :</strong> Impossible de charger les données du championnat. Veuillez actualiser la page ou vérifier votre réseau.</div>';
    }
  },

  initCursor() {
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
  },

  initPageTransitions() {
    document.body.classList.add('page-transition');
    
    document.querySelectorAll('a').forEach(a => {
      if (a.hostname === window.location.hostname && a.getAttribute('target') !== '_blank' && !a.getAttribute('href').startsWith('#')) {
        a.addEventListener('click', e => {
          e.preventDefault();
          document.body.classList.add('fade-out');
          setTimeout(() => {
            window.location.href = a.href;
          }, 500);
        });
      }
    });

    const header = document.querySelector('.site-header');
    if (header) {
      const isHeroPage = document.querySelector('.hero-section') !== null;
      window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
          header.classList.add(isHeroPage ? 'scrolled-dark' : 'scrolled');
        } else {
          header.classList.remove('scrolled', 'scrolled-dark');
        }
      });
    }
  },

  initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('do-count') && !entry.target.dataset.counted) {
             this.animateCounter(entry.target);
             entry.target.dataset.counted = "true";
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  },

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      el.innerText = Math.floor(easeOutQuart * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.innerText = target + (el.dataset.plus ? '+' : '');
    };
    requestAnimationFrame(update);
  },

  async loadData() {
    const basePath = window.GEH_BASE || '.';
    const fetchData = async (file) => {
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
    };

    const [configData, editionsData, equipesData, matchsData] = await Promise.all([
      fetchData('config.json'),
      fetchData('editions.json').catch(() => ({ editions: [] })),
      fetchData('equipes.json').catch(() => ({ equipes: [] })),
      fetchData('matchs.json').catch(() => ({ matchs: [] }))
    ]);

    this.config = configData.championnat;
    this.editions = editionsData.editions || [];
    this.equipes = equipesData.equipes || [];
    this.matchs = matchsData.matchs || [];
  },

  setupNavigation() {
  },

  renderCommonElements() {
    const yearElem = document.getElementById('footerYear');
    if (yearElem) yearElem.textContent = new Date().getFullYear();

    const badges = document.querySelectorAll('.nav-edition-badge');
    badges.forEach(b => {
      b.textContent = this.config.currentEdition;
    });

    const footerArchives = document.getElementById('footerArchivesList');
    if (footerArchives) {
       const pastEditions = this.editions.filter(e => e.id !== this.config.currentEdition).slice(0, 4);
       footerArchives.innerHTML = pastEditions.map(e => `<li><a href="edition.html?id=${e.id}"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Édition ${e.id}</a></li>`).join('') + `<li><a href="archives.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> <strong>Voir toutes les archives...</strong></a></li>`;
    }
  },

  getEquipe(id) {
    return this.equipes.find(e => e.id === id) || { nom_officiel: 'Équipe inconnue', nom_court: 'Inconnu', id: id };
  },

  getJoueur(id) {
    if (!id) return null;
    for (const eq of this.equipes) {
      const j = (eq.joueurs || []).find(j => j.id === id);
      if (j) return { ...j, equipe: eq };
    }
    return null;
  },

  renderAvatarCard({ photo, nom, prenom, label, sublabel, accentColor }) {
    const imgSrc = photo || null;
    const initials = (prenom ? prenom[0] : '') + (nom ? nom[0] : '');
    const color = accentColor || 'var(--color-primary)';
    const avatar = imgSrc
      ? `<img src="${imgSrc}" alt="${prenom} ${nom}" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:3px solid ${color};" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div style="display:none;width:80px;height:80px;border-radius:50%;background:${color}20;border:3px solid ${color};align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;color:${color};">${initials}</div>`
      : `<div style="width:80px;height:80px;border-radius:50%;background:${color}20;border:3px solid ${color};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;color:${color};">${initials}</div>`;
    return `
      <div style="display:flex;align-items:center;gap:1.25rem;">
        <div style="position:relative;flex-shrink:0;">${avatar}</div>
        <div>
          <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:${color};font-weight:700;margin-bottom:0.25rem;">${label}</div>
          <div style="font-family:var(--font-heading);font-size:1.1rem;font-weight:800;">${prenom} ${nom}</div>
          ${sublabel ? `<div style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:0.15rem;">${sublabel}</div>` : ''}
        </div>
      </div>`;
  },

  renderBreadcrumbs() {
     const breadcrumb = document.querySelectorAll('.breadcrumb');
     breadcrumb.forEach(b => {
        let current = '';
        const id = new URLSearchParams(window.location.search).get('id');
        if(window.location.pathname.includes('edition.html')) { current = 'Édition ' + id; }
        else if(window.location.pathname.includes('match.html')) { current = 'Match ' + id; }
        else if(window.location.pathname.includes('equipe.html')) { current = 'Équipe ' + id; }
        else if(window.location.pathname.includes('bracket.html')) { current = 'Tableau Final'; }
        
        b.innerHTML = '<a href="index.html">Accueil</a> <i class="ph-bold ph-caret-right"></i> <a href="archives.html">Archives</a> <i class="ph-bold ph-caret-right"></i> <span>' + current + '</span>';
     });
  },

  initBackToTop() {
     const btn = document.getElementById('backToTop');
     if(!btn) return;
     window.addEventListener('scroll', () => {
         if (window.scrollY > 300) btn.style.display = 'flex';
         else btn.style.display = 'none';
     });
     btn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  },

  getMatch(id) { return this.matchs.find(m => m.id === id); },
  getEdition(id) { return this.editions.find(e => e.id === id); },

  calculateClassement(editionId) {
    const matchs = this.matchs.filter(m => m.edition === editionId && (window.GEH_PHASE_GROUPE_ONLY ? m.phase === 'phase_groupe' : true));
    let stats = {};

    this.equipes.forEach(eq => {
      stats[eq.id] = { equipe: eq, MJ: 0, V: 0, D: 0, N: 0, PtsPlus: 0, PtsMoins: 0, Diff: 0, Pts: 0 };
    });

    matchs.forEach(m => {
      if(!stats[m.equipe_A] || !stats[m.equipe_B]) return;

      stats[m.equipe_A].MJ++; stats[m.equipe_B].MJ++;
      stats[m.equipe_A].PtsPlus += m.score_A; stats[m.equipe_B].PtsPlus += m.score_B;
      stats[m.equipe_A].PtsMoins += m.score_B; stats[m.equipe_B].PtsMoins += m.score_A;

      if (m.score_A > m.score_B) { stats[m.equipe_A].V++; stats[m.equipe_A].Pts += 3; stats[m.equipe_B].D++; }
      else if (m.score_B > m.score_A) { stats[m.equipe_B].V++; stats[m.equipe_B].Pts += 3; stats[m.equipe_A].D++; }
      else { stats[m.equipe_A].N++; stats[m.equipe_A].Pts += 1; stats[m.equipe_B].N++; stats[m.equipe_B].Pts += 1; }
    });

    return Object.values(stats)
      .map(s => { s.Diff = s.PtsPlus - s.PtsMoins; return s; })
      .filter(s => s.MJ > 0)
      .sort((a, b) => b.Pts - a.Pts || b.Diff - a.Diff || b.PtsPlus - a.PtsPlus);
  },

  makeTableSortable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const ths = table.querySelectorAll('th');
    const tbody = table.querySelector('tbody');

    ths.forEach((th, i) => {
      th.addEventListener('click', () => {
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
        th.dataset.dir = dir;
        
        ths.forEach(h => {
           let icon = h.querySelector('i.ph-caret-up, i.ph-caret-down');
           if (icon) icon.remove();
        });
        
        th.innerHTML += dir === 'asc' ? ' <i class="ph-bold ph-caret-up" aria-hidden="true"></i>' : ' <i class="ph-bold ph-caret-down" aria-hidden="true"></i>';

        rows.sort((a, b) => {
          const aCol = a.cells[i].innerText.replace('+', '').trim();
          const bCol = b.cells[i].innerText.replace('+', '').trim();
          const aVal = isNaN(aCol) ? aCol : parseFloat(aCol);
          const bVal = isNaN(bCol) ? bCol : parseFloat(bCol);

          if (aVal < bVal) return dir === 'asc' ? -1 : 1;
          if (aVal > bVal) return dir === 'asc' ? 1 : -1;
          return 0;
        });
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  },

  getMedalIcon(index) {
     if (index === 0) return '<i class="ph-fill ph-medal medal-gold" aria-hidden="true"></i>';
     if (index === 1) return '<i class="ph-fill ph-medal medal-silver" aria-hidden="true"></i>';
     if (index === 2) return '<i class="ph-fill ph-medal medal-bronze" aria-hidden="true"></i>';
     return index + 1;
  },

  renderHomepage() {
    const container = document.getElementById('latestMatchs');
    if (!container) return;
    
    const sorted = [...this.matchs].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    if(sorted.length === 0) { container.innerHTML = '<p>Aucun match récent.</p>'; return; }

    let html = '<div class="grid-cards">';
    sorted.forEach((m, idx) => {
      const eqA = this.getEquipe(m.equipe_A);
      const eqB = this.getEquipe(m.equipe_B);
      html += `
      <div class="card fade-up" style="animation-delay: ${idx * 0.15}s">
        <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 1rem;"><i class="ph-light ph-calendar-blank" aria-hidden="true"></i> ${m.date} · Édition ${m.edition}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; ${m.vainqueur===m.equipe_A ? 'font-weight:bold; color:var(--color-primary);':''}">
          <span>${eqA.nom_court}</span><span class="score-td" style="font-size:1.25rem;">${m.score_A}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; ${m.vainqueur===m.equipe_B ? 'font-weight:bold; color:var(--color-primary);':''}">
          <span>${eqB.nom_court}</span><span class="score-td" style="font-size:1.25rem;">${m.score_B}</span>
        </div>
        <a href="match.html?id=${m.id}" class="btn btn-outline btn-dark" style="width:100%; margin-top:1.5rem; padding:0.5rem; border-color:var(--color-border); color:var(--color-primary);"><i class="ph-bold ph-lightning" aria-hidden="true"></i> Détails</a>
      </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  renderEditionDetails(id) {
    const edition = this.getEdition(id);
    if (!edition) { window.location.replace('404.html'); return; }

    document.title = `Édition ${edition.id} — GEH Mwanga`;
    const titleEl = document.getElementById('editionTitle');
    if (titleEl) titleEl.textContent = `Édition ${edition.id}`;

    const pdfContainer = document.getElementById('edition-pdf-container');
    if (pdfContainer) {
       if (edition.pdf_resultats && edition.pdf_resultats.trim() !== '') {
          pdfContainer.innerHTML = `
            <div class="glass fade-up" style="border-radius: var(--radius-xl); padding: 2.5rem; display: flex; align-items: center; justify-content: space-between; margin-bottom:3rem; background: var(--color-white)!important;">
              <div style="display:flex; align-items:center; gap: 1.5rem;">
                <i class="ph-duotone ph-file-pdf" style="font-size:3.5rem; color:var(--color-accent-red);" aria-hidden="true"></i>
                <div><strong style="display:block; font-family:var(--font-heading); font-size:1.5rem;">Feuille de résultats officielle</strong>
                  <span style="color:var(--color-text-secondary); font-size:1rem;">Document PDF certifié de la compétition</span></div>
              </div>
              <a href="${edition.pdf_resultats}" class="btn btn-primary" target="_blank"><i class="ph-bold ph-download-simple" aria-hidden="true"></i> Télécharger</a>
            </div>
          `;
       } else {
          pdfContainer.innerHTML = `
            <div class="asset-placeholder fade-up" style="margin-bottom: 3rem;">
               <i class="ph-light ph-file-pdf" aria-hidden="true"></i>
               <p>Document PDF non disponible pour cette édition.</p>
            </div>
          `;
       }
    }

    // --- Champion + MVP panel ---
    const honorContainer = document.getElementById('edition-honors');
    if (honorContainer && edition.statut === 'terminee' && edition.champion) {
      const champEq = this.getEquipe(edition.champion);
      const mvpJoueur = edition.mvp ? this.getJoueur(edition.mvp) : null;
      const mvpNom = edition.mvp_nom || '';
      const accentChamp = champEq.couleur_identite || 'var(--color-primary)';

      const logoHtml = champEq.logo
        ? `<img src="${champEq.logo}" alt="Logo ${champEq.nom_court}" style="width:72px;height:72px;object-fit:contain;border-radius:12px;background:#fff;padding:6px;border:2px solid ${accentChamp};" onerror="this.style.display='none';">`
        : `<div style="width:72px;height:72px;border-radius:12px;background:${accentChamp}20;border:2px solid ${accentChamp};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.75rem;color:${accentChamp};">${champEq.nom_court?.substring(0,2) || '?'}</div>`;

      const mvpBlock = mvpJoueur
        ? this.renderAvatarCard({ photo: mvpJoueur.photo, nom: mvpJoueur.nom, prenom: mvpJoueur.prenom, label: '🏅 MVP de l\'édition', sublabel: mvpJoueur.equipe?.nom_court, accentColor: 'var(--color-gold)' })
        : mvpNom
          ? `<div style="display:flex;align-items:center;gap:1rem;"><div style="width:64px;height:64px;border-radius:50%;background:var(--color-gold)20;border:3px solid var(--color-gold);display:flex;align-items:center;justify-content:center;"><i class="ph-fill ph-user" style="font-size:2rem;color:var(--color-gold);"></i></div><div><div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--color-gold);font-weight:700;margin-bottom:0.25rem;">🏅 MVP de l'édition</div><div style="font-family:var(--font-heading);font-size:1.1rem;font-weight:800;">${mvpNom}</div></div></div>`
          : '';

      honorContainer.innerHTML = `
        <div class="card fade-up" style="padding:2rem;background:linear-gradient(135deg,${accentChamp}10,var(--color-gold)08);border:1.5px solid ${accentChamp};margin-bottom:2.5rem;">
          <div class="grid-2-cols" style="align-items:center;">
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--color-gold);font-weight:700;margin-bottom:0.75rem;"><i class="ph-fill ph-trophy"></i> Équipe Championne</div>
              <div style="display:flex;align-items:center;gap:1rem;">
                ${logoHtml}
                <div>
                  <div style="font-family:var(--font-heading);font-size:1.3rem;font-weight:900;">${champEq.nom_officiel}</div>
                  <div style="font-size:0.85rem;color:var(--color-text-secondary);margin-top:0.2rem;">${edition.faits_marquants || ''}</div>
                </div>
              </div>
            </div>
            <div>${mvpBlock}</div>
          </div>
        </div>`;
    } else if (honorContainer) {
      honorContainer.innerHTML = '';
    }

    const classement = this.calculateClassement(id);
    const tableBody = document.getElementById('classementEdBody');
    if (tableBody) {
      tableBody.innerHTML = classement.map((row, i) => `
        <tr class="fade-up" style="transition-delay: ${i*0.05}s">
          <td class="text-center">${this.getMedalIcon(i)}</td>
          <td><a href="equipe.html?id=${row.equipe.id}"><strong>${row.equipe.nom_court}</strong></a></td>
          <td class="score-td">${row.MJ}</td>
          <td class="score-td" style="color:var(--color-accent-green);">${row.V}</td>
          <td class="score-td" style="color:var(--color-accent-red);">${row.D}</td>
          <td class="score-td">${row.N}</td>
          <td class="score-td">${row.PtsPlus}</td>
          <td class="score-td">${row.PtsMoins}</td>
          <td class="score-td">${row.Diff > 0 ? '+'+row.Diff : row.Diff}</td>
          <td class="score-td main-score">${row.Pts}</td>
        </tr>
      `).join('');
      this.makeTableSortable('classementEdTable');
    }

    const edMatchs = this.matchs.filter(m => m.edition === id);
    const matchsContainer = document.getElementById('editionMatchs');
    if(matchsContainer) {
       let html = '<div style="display:flex; flex-direction:column; gap:1.5rem;">';
       edMatchs.forEach((m, idx) => {
          const eqA = this.getEquipe(m.equipe_A);
          const eqB = this.getEquipe(m.equipe_B);
          html += `
          <div class="card fade-up" style="padding:2rem; transition-delay: ${idx*0.1}s">
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 1rem;"><i class="ph-light ph-clock" aria-hidden="true"></i> ${m.date} - ${m.phase.replace('_',' ')}</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem; ${m.vainqueur===m.equipe_A ? 'font-weight:bold;':''}">
              <span style="font-size:1.1rem;">${eqA.nom_court}</span><span class="score-td">${m.score_A}</span>
            </div>
            <div style="display:flex; justify-content:space-between; ${m.vainqueur===m.equipe_B ? 'font-weight:bold;':''}">
              <span style="font-size:1.1rem;">${eqB.nom_court}</span><span class="score-td">${m.score_B}</span>
            </div>
            <a href="match.html?id=${m.id}" style="display:inline-flex; align-items:center; gap:0.5rem; margin-top:1.5rem; font-size:1rem; color:var(--color-primary); font-weight:600;"><i class="ph-bold ph-arrow-right" aria-hidden="true"></i> Voir résultats complets</a>
          </div>`;
       });
       html += '</div>';
       matchsContainer.innerHTML = html;
    }
  },

  renderMatchDetails(id) {
    const match = this.getMatch(id);
    if (!match) { window.location.replace('404.html'); return; }

    const eqA = this.getEquipe(match.equipe_A);
    const eqB = this.getEquipe(match.equipe_B);

    document.getElementById('m-phase').innerHTML = `<i class="ph-duotone ph-flag-pennant" aria-hidden="true"></i> ${match.edition} · ${match.phase.replace('_', ' ')}`;
    document.getElementById('m-date').innerHTML = `<i class="ph-light ph-calendar-blank" aria-hidden="true"></i> ${match.date}`;
    document.getElementById('m-nomA').textContent = eqA.nom_officiel;
    document.getElementById('m-nomB').textContent = eqB.nom_officiel;
    document.getElementById('m-scoreA').textContent = match.score_A;
    document.getElementById('m-scoreB').textContent = match.score_B;

    if(match.vainqueur === eqA.id) {
      document.getElementById('m-scoreA').style.color = 'var(--color-gold)';
    } else if (match.vainqueur === eqB.id) {
      document.getElementById('m-scoreB').style.color = 'var(--color-gold)';
    }

    const tBody = document.getElementById('m-manches');
    if(tBody && match.score_par_manche) {
       let html = '';
       let i = 0;
       for(const [manche, scores] of Object.entries(match.score_par_manche)) {
          if (manche === 'non_repondues') {
             html += `<tr style="background: var(--color-surface); opacity:0.7;">
               <td><em>Points non attribués (sans réponses)</em></td>
               <td colspan="2" class="score-td text-center">${scores}</td>
             </tr>`;
             continue;
          }
          const mName = manche.replace('_', ' ').toUpperCase();
          html += `<tr class="fade-up" style="transition-delay: ${i*0.05}s">
            <td style="font-weight:600;">${mName}</td>
            <td class="score-td text-center">${scores.A}</td>
            <td class="score-td text-center">${scores.B}</td>
          </tr>`;
          i++;
       }
       tBody.innerHTML = html;
    }

    // --- Homme du match ---
    const hdmContainer = document.getElementById('m-homme-du-match');
    if (hdmContainer) {
      const joueur = match.homme_du_match ? this.getJoueur(match.homme_du_match) : null;
      if (joueur) {
        hdmContainer.innerHTML = `
          <div class="card fade-up" style="margin-top:2.5rem;padding:2rem;background:linear-gradient(135deg,var(--color-primary)08,var(--color-gold)10);border:1.5px solid var(--color-gold);">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
              <i class="ph-fill ph-star" style="color:var(--color-gold);font-size:1.4rem;" aria-hidden="true"></i>
              <h3 style="margin:0;font-size:1.1rem;">Homme du Match</h3>
            </div>
            ${this.renderAvatarCard({
              photo: joueur.photo,
              nom: joueur.nom,
              prenom: joueur.prenom,
              label: '⭐ Joueur décisif',
              sublabel: joueur.equipe?.nom_court + (joueur.stats?.specialite ? ' · ' + joueur.stats.specialite : ''),
              accentColor: 'var(--color-gold)'
            })}
          </div>`;
      } else {
        hdmContainer.innerHTML = '';
      }
    }
  },

  renderEquipeDetails(id) {
      const eq = this.getEquipe(id);
      if(!eq || eq.nom_officiel === 'Équipe inconnue') { window.location.replace('404.html'); return; }
      
      document.title = eq.nom_officiel + " — GEH IMGoma";
      document.getElementById('eq-title').textContent = eq.nom_officiel;
      document.getElementById('eq-subtitle').textContent = eq.nom_court;
      document.getElementById('eq-logo-placeholder').innerHTML = '<i class="ph-duotone ph-shield-check" aria-hidden="true"></i>';
      if(eq.couleur_identite) {
         document.getElementById('eq-logo-placeholder').style.backgroundColor = eq.couleur_identite + '20';
         document.getElementById('eq-logo-placeholder').style.color = eq.couleur_identite;
      }
      
      document.getElementById('eq-section').textContent = eq.classe_section || '-';
      document.getElementById('eq-encadrant').textContent = eq.encadrant || '-';
      document.getElementById('eq-capitaine').textContent = eq.capitaine_actuel || '-';
      document.getElementById('eq-part').textContent = eq.editions_participees ? eq.editions_participees.length : 0;
  },

  renderArchives() {
    const container = document.getElementById('archivesList');
    if(!container) return;

    const archives = this.editions.filter(ed => ed.id !== this.config.currentEdition);
    let html = '';
    archives.forEach((ed, idx) => {
       const champion = ed.champion ? this.getEquipe(ed.champion).nom_court : 'Non défini';
       html += `
       <div class="card fade-up" style="margin-bottom:2rem; transition-delay: ${idx*0.1}s">
         <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--color-border); padding-bottom:1.5rem;">
           <div>
             <h3 style="margin-bottom:0.5rem; font-size:1.75rem;"><i class="ph-duotone ph-archive-box" aria-hidden="true"></i> Édition ${ed.id}</h3>
             <span class="badge badge-blue">Terminée</span>
           </div>
           <div style="text-align:right;">
             <div style="font-size:0.875rem; color:var(--color-text-secondary); text-transform:uppercase; letter-spacing:0.05em;"><i class="ph-duotone ph-trophy medal-gold" aria-hidden="true"></i> Champion</div>
             <strong style="font-size:1.5rem;">${champion}</strong>
           </div>
         </div>
         <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; text-align:center; margin-bottom:2rem;">
            <div><div style="font-size:0.875rem; color:var(--color-text-secondary); margin-bottom:0.5rem; text-transform:uppercase;">Matchs</div><div class="score-td" style="font-size:1.5rem;">${ed.nb_matchs || '?'}</div></div>
            <div><div style="font-size:0.875rem; color:var(--color-text-secondary); margin-bottom:0.5rem; text-transform:uppercase;">Équipes</div><div class="score-td" style="font-size:1.5rem;">${ed.nb_equipes || '?'}</div></div>
            <div><div style="font-size:0.875rem; color:var(--color-text-secondary); margin-bottom:0.5rem; text-transform:uppercase;">Score Max</div><div class="score-td" style="font-size:1.5rem; color:var(--color-accent-green);">${ed.meilleur_score_match || '?'}</div></div>
         </div>
         <a href="edition.html?id=${ed.id}" class="btn btn-outline btn-dark" style="width:100%"><i class="ph-bold ph-table" aria-hidden="true"></i> Voir le classement complet</a>
       </div>`;
    });
    container.innerHTML = html;
  },

  renderBracket(editionId) {
     const bracketGrid = document.getElementById('bracketGrid');
     const skeleton = document.getElementById('bracketSkeleton');
     const bracketBreadcrumb = document.getElementById('bracketBreadcrumb');
     
     if (skeleton) skeleton.style.display = 'none';
     if (bracketGrid) bracketGrid.style.opacity = '1';

     if(!editionId) editionId = this.config.currentEdition;
     
     const select = document.getElementById('bracketEditionSelect');
     if (select && select.options.length === 1) {
         this.editions.forEach(ed => {
            select.add(new Option('Édition ' + ed.id, ed.id));
         });
         select.value = editionId;
         select.addEventListener('change', (e) => this.renderBracket(e.target.value));
     }
     
     if(bracketBreadcrumb) {
         bracketBreadcrumb.innerHTML = '<a href="index.html">Accueil</a> <i class="ph-bold ph-caret-right"></i> <span>Tableau Final ' + editionId + '</span>';
     }

     const matches = this.matchs.filter(m => m.edition === editionId);
     const getPhaseMatch = (phaseName) => matches.filter(m => m.phase === phaseName);

     const rendermatchesHTML = (list) => list.map(m => {
          const eqA = this.getEquipe(m.equipe_A);
          const eqB = this.getEquipe(m.equipe_B);
          const drawMeta = m.phase.replace('_', ' ').toUpperCase() + ' · ' + m.id;
          return `
          <div class="bracket-match" id="match-${m.id}">
             <div class="bracket-team ${m.vainqueur === m.equipe_A ? 'winner' : 'loser'} team-a">
               <span class="team-name">${eqA.nom_court}</span>
               <span class="bracket-team-score">${m.score_A}</span>
             </div>
             <div class="bracket-team ${m.vainqueur === m.equipe_B ? 'winner' : 'loser'} team-b">
               <span class="team-name">${eqB.nom_court}</span>
               <span class="bracket-team-score">${m.score_B}</span>
             </div>
             <div class="match-meta">${m.vainqueur ? (m.vainqueur === m.equipe_A ? eqA.nom_court : eqB.nom_court) + ' qualifié(e) <i class="ph-fill ph-crown" style="color:var(--color-gold);"></i>' : drawMeta}</div>
          </div>
          `;
     }).join('');

     const huitiemes = getPhaseMatch('huitieme');
     const quarts = getPhaseMatch('quart');
     const demis = getPhaseMatch('demi');
     const finales = getPhaseMatch('finale');
     
     const colH = document.querySelector('#col-huitieme .bracket-matches');
     const colQ = document.querySelector('#col-quart .bracket-matches');
     const colD = document.querySelector('#col-demi .bracket-matches');
     const colF = document.querySelector('#col-finale .bracket-matches');
     
     const emptyMsg = '<div style="color:var(--color-text-secondary); font-size:0.85rem; text-align:center; padding:1rem; border:1px dashed var(--color-border); border-radius:4px;">En attente des qualifiés</div>';

     if(colH) colH.innerHTML = huitiemes.length ? rendermatchesHTML(huitiemes) : emptyMsg;
     if(colQ) colQ.innerHTML = quarts.length ? rendermatchesHTML(quarts) : emptyMsg;
     if(colD) colD.innerHTML = demis.length ? rendermatchesHTML(demis) : emptyMsg;
     if(colF) colF.innerHTML = finales.length ? rendermatchesHTML(finales) : emptyMsg;
     
     setTimeout(() => this.drawBracketLines(), 100);
  },

  drawBracketLines() {
     const svg = document.getElementById('bracketLines');
     const grid = document.getElementById('bracketGrid');
     if(!svg || !grid) return;
     
     svg.innerHTML = '';
     const rectGrid = grid.getBoundingClientRect();
     
     const connectCols = (colA, colB) => {
        const matchesA = Array.from(document.querySelectorAll(`#${colA} .bracket-match`));
        const matchesB = Array.from(document.querySelectorAll(`#${colB} .bracket-match`));
        if (matchesB.length === 0) return;
        
        matchesA.forEach((mA, idx) => {
           const idxB = Math.floor(idx / 2);
           const mB = matchesB[idxB];
           if(!mB) return;
           
           const rA = mA.getBoundingClientRect();
           const rB = mB.getBoundingClientRect();
           
           const startX = rA.right - rectGrid.left + 5;
           const startY = rA.top - rectGrid.top + (rA.height / 2);
           const endX = rB.left - rectGrid.left - 5;
           const endY = rB.top - rectGrid.top + (rB.height / 2);
           
           const midX = startX + (endX - startX) / 2;
           
           const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
           path.setAttribute("d", `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`);
           path.setAttribute("class", "bracket-line-path");
           svg.appendChild(path);
        });
     };
     
     connectCols('col-huitieme', 'col-quart');
     connectCols('col-quart', 'col-demi');
     connectCols('col-demi', 'col-finale');
  },

  renderTimeline() {
     const container = document.getElementById('palmaresTimeline');
     const skeleton = document.getElementById('palmaresSkeleton');
     if (!container) return;
     if (skeleton) skeleton.style.display = 'none';

     let html = '';
     this.editions.forEach((ed, idx) => {
        const champEq = ed.champion ? this.getEquipe(ed.champion) : null;
        const champNom = champEq ? champEq.nom_officiel : 'Non défini';
        const accentChamp = champEq?.couleur_identite || 'var(--color-primary)';
        const mvpJoueur = ed.mvp ? this.getJoueur(ed.mvp) : null;
        const mvpNom = ed.mvp_nom || ed.mvp || '-';

        const logoHtml = champEq?.logo
          ? `<img src="${champEq.logo}" alt="${champEq.nom_court}" style="width:56px;height:56px;object-fit:contain;border-radius:10px;background:#fff;padding:4px;border:2px solid ${accentChamp};margin-right:0.75rem;flex-shrink:0;" onerror="this.style.display='none';">`
          : champEq ? `<div style="width:56px;height:56px;border-radius:10px;background:${accentChamp}25;border:2px solid ${accentChamp};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.25rem;color:${accentChamp};margin-right:0.75rem;flex-shrink:0;">${champEq.nom_court?.substring(0,2)}</div>` : '';

        const mvpBlock = mvpJoueur
          ? this.renderAvatarCard({ photo: mvpJoueur.photo, nom: mvpJoueur.nom, prenom: mvpJoueur.prenom, label: '🏅 MVP', sublabel: mvpJoueur.equipe?.nom_court, accentColor: 'var(--color-gold)' })
          : `<div style="font-size:0.85rem;color:var(--color-text-secondary);"><i class="ph-fill ph-user-circle" style="color:var(--color-gold);"></i> MVP : <strong style="color:var(--color-text-primary);">${mvpNom}</strong></div>`;

        html += `
        <div class="timeline-item fade-up" style="transition-delay: ${idx*0.2}s">
           <div class="timeline-icon"><i class="ph-fill ph-trophy"></i></div>
           <div class="timeline-content">
             <div style="font-size:0.875rem; color:var(--color-primary); font-weight:800; font-family:var(--font-heading); margin-bottom:0.75rem;">ÉDITION ${ed.id}</div>
             <div style="display:flex;align-items:center;margin-bottom:1rem;">
               ${logoHtml}
               <h3 style="margin:0; color:var(--color-gold); font-size:1.35rem;">${champNom}</h3>
             </div>
             <div style="padding-top:0.75rem;border-top:1px solid var(--color-border);">${mvpBlock}</div>
           </div>
        </div>`;
     });
     container.innerHTML = html;
  },

  renderCharts() {
     const canvas = document.getElementById('scoresChart');
     if(!canvas) return;
     
     const ctx = canvas.getContext('2d');
     canvas.width = canvas.parentElement.clientWidth;
     canvas.height = canvas.parentElement.clientHeight;
     
     const data = this.editions.map(ed => parseInt(ed.meilleur_score_match) || 0).reverse();
     const labels = this.editions.map(ed => ed.id).reverse();
     
     const max = Math.max(...data) + 100;
     const stepX = canvas.width / (data.length - 1 || 1);
     
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     ctx.beginPath();
     data.forEach((val, i) => {
         const x = i * stepX;
         const y = canvas.height - (val / max * canvas.height);
         if (i === 0) ctx.moveTo(x, y);
         else ctx.lineTo(x, y);
     });
     ctx.strokeStyle = '#E9C46A';
     ctx.lineWidth = 4;
     ctx.stroke();
     
     ctx.fillStyle = '#0F1E3A';
     data.forEach((val, i) => {
         const x = i * stepX;
         const y = canvas.height - (val / max * canvas.height);
         ctx.beginPath();
         // inner circle
         ctx.arc(x, y, 6, 0, Math.PI*2);
         ctx.fill();
         ctx.stroke();
         
         ctx.font = 'bold 14px Outfit';
         ctx.fillStyle = '#0F1E3A';
         ctx.fillText(val, x - 12, y - 15);
     });
  },
  
  renderClassementGeneral() {
       const stats = {};
       this.equipes.forEach(eq => {
         stats[eq.id] = { equipe: eq, MJ: 0, V: 0, D: 0, N: 0, PtsPlus: 0, PtsMoins: 0, Pts: 0 };
       });
       this.matchs.filter(m => m.edition === this.config.currentEdition).forEach(m => {
          if(!stats[m.equipe_A] || !stats[m.equipe_B]) return;
          stats[m.equipe_A].MJ++; stats[m.equipe_B].MJ++;
          stats[m.equipe_A].PtsPlus += m.score_A; stats[m.equipe_B].PtsPlus += m.score_B;
          stats[m.equipe_A].PtsMoins += m.score_B; stats[m.equipe_B].PtsMoins += m.score_A;
          
          if(m.score_A > m.score_B) { stats[m.equipe_A].V++; stats[m.equipe_B].D++; stats[m.equipe_A].Pts+=3; }
          else if(m.score_A < m.score_B) { stats[m.equipe_B].V++; stats[m.equipe_A].D++; stats[m.equipe_B].Pts+=3; }
       });

       const sorted = Object.values(stats)
         .map(s => { s.Diff = s.PtsPlus - s.PtsMoins; return s; })
         .filter(s => s.MJ > 0)
         .sort((a,b) => b.Pts - a.Pts || b.Diff - a.Diff);
       
       const tb = document.getElementById('classementGenBody');
       if(tb) {
           tb.innerHTML = sorted.map((row, i) => `
              <tr class="fade-up" style="transition-delay: ${i*0.05}s">
                <td class="text-center">${this.getMedalIcon(i)}</td>
                <td><a href="equipe.html?id=${row.equipe.id}"><strong>${row.equipe.nom_court}</strong></a></td>
                <td class="score-td">${row.MJ}</td>
                <td class="score-td" style="color:var(--color-accent-green);">${row.V}</td>
                <td class="score-td" style="color:var(--color-accent-red);">${row.D}</td>
                <td class="score-td">${row.Diff > 0 ? '+'+row.Diff : row.Diff}</td>
                <td class="score-td main-score">${row.Pts}</td>
              </tr>
           `).join('');
           this.makeTableSortable('classementGenTable');
       }
  },

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
      this.editions.forEach(ed => selectEd.add(new Option('Édition ' + ed.id, ed.id)));
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
          : i === 1 ? '<i class="ph-fill ph-medal" style="color:#C0C0C0;font-size:1.2rem;"></i>'
          : i === 2 ? '<i class="ph-fill ph-medal" style="color:#CD7F32;font-size:1.2rem;"></i>'
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
      if (!filtered.length) {
        const tb = document.getElementById('joueursTableBody');
        if (tb) tb.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;">Aucun joueur trouvé.</td></tr>';
      } else renderTable(filtered);
    };

    if (selectSpec) selectSpec.addEventListener('change', filterAndRender);
    if (selectEd)   selectEd.addEventListener('change', filterAndRender);
    this.makeTableSortable('joueursTable');
    this.initAnimations();
  },

  initHamburger() {
    const btn  = document.getElementById('hamburgerBtn');
    const nav  = document.getElementById('mainNav');
    const icon = document.getElementById('hamburgerIcon');

    if (!btn || !nav) return;

    const closeMenu = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      if (icon) icon.className = 'ph-bold ph-list';
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (icon) icon.className = isOpen ? 'ph-bold ph-x' : 'ph-bold ph-list';
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !nav.contains(e.target)) closeMenu();
    });

    // Close on link click (for SPA-style nav)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => GEH.init());
