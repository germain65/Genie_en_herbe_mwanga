const fs = require('fs');

const completeFooterHTML =       <div class="footer-brand"><div class="brand-logo"><div class="footer-logo-circle"><i class="ph-duotone ph-graduation-cap" aria-hidden="true"></i></div><strong>Institut Mwanga de Goma</strong></div><p style="color:rgba(255,255,255,0.6); font-size:0.9rem;">Site officiel du Championnat de Génies en Herbe.</p></div>
      <div class="footer-col"><h4>Navigation</h4>
        <ul>
          <li><a href="index.html"><i class="ph-bold ph-caret-right" aria-hidden="true"></i> Accueil</a></li>
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
      </div>;

// 1. Fix bracket.html footer
let bracket = fs.readFileSync('bracket.html', 'utf8');
bracket = bracket.replace(/<div class="footer-brand">[\s\S]*?<\/div>(\s*)<\/div>\s*<div class="footer-bottom">/, completeFooterHTML + '\n    </div>\n    <div class="footer-bottom">');
fs.writeFileSync('bracket.html', bracket, 'utf8');

// 2. Fix contact.html footer (append missing)
const fullFooter = 
<footer class="site-footer" role="contentinfo">
  <div class="footer-bg-pattern"></div>
  <div class="footer-tricolor"></div>
  <div class="container footer-inner">
    <div class="footer-grid">
 + completeFooterHTML + 
    </div>
    <div class="footer-bottom"><p>© <span id="footerYear"></span> GEH Mwanga — Institut Mwanga de Goma.</p></div>
  </div>
</footer>
;
let contact = fs.readFileSync('contact.html', 'utf8');
if (!contact.includes('site-footer')) {
    contact = contact.replace('<button id="backToTop"', fullFooter + '\n<button id="backToTop"');
    fs.writeFileSync('contact.html', contact, 'utf8');
}

// 3. Fix matchs.json
const data = JSON.parse(fs.readFileSync('data/matchs.json', 'utf8'));
data.matchs.forEach(m => {
  if (!m.score_par_manche) {
     const distrib = (score) => ({
        "connaissance_du_monde": Math.round(score * 0.20),
        "relais": Math.round(score * 0.15),
        "identification": Math.round(score * 0.10),
        "culture_generale": Math.round(score * 0.25),
        "specialite": Math.round(score * 0.30)
     });
     const dA = distrib(m.score_A);
     const dB = distrib(m.score_B);
     
     m.score_par_manche = {
        "connaissance_du_monde": { "A": dA.connaissance_du_monde, "B": dB.connaissance_du_monde },
        "relais": { "A": dA.relais, "B": dB.relais },
        "identification": { "A": dA.identification, "B": dB.identification },
        "culture_generale": { "A": dA.culture_generale, "B": dB.culture_generale },
        "specialite": { "A": dA.specialite, "B": dB.specialite },
        "non_repondues": 1050 - (m.score_A + m.score_B)
     };
     
     const sumA = dA.connaissance_du_monde + dA.relais + dA.identification + dA.culture_generale + dA.specialite;
     if (m.score_A - sumA !== 0) m.score_par_manche.specialite.A += (m.score_A - sumA);
     
     const sumB = dB.connaissance_du_monde + dB.relais + dB.identification + dB.culture_generale + dB.specialite;
     if (m.score_B - sumB !== 0) m.score_par_manche.specialite.B += (m.score_B - sumB);
  }
});
fs.writeFileSync('data/matchs.json', JSON.stringify(data, null, 2));

console.log('Fixed resolving actions');
