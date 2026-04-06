const fs = require('fs');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const footerHTML = `
<footer class="site-footer" role="contentinfo">
  <div class="footer-bg-pattern"></div>
  <div class="footer-tricolor"></div>
  <div class="container footer-inner">
    <div class="footer-grid">
      <div class="footer-brand"><div class="brand-logo"><div class="footer-logo-circle"><i class="ph-duotone ph-graduation-cap" aria-hidden="true"></i></div><strong>Institut Mwanga de Goma</strong></div><p style="color:rgba(255,255,255,0.6); font-size:0.9rem;">Site officiel du Championnat de Génies en Herbe.</p></div>
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
      </div>
    </div>
    <div class="footer-bottom"><p>© <span id="footerYear"></span> GEH Mwanga — Institut Mwanga de Goma.</p></div>
  </div>
</footer>
`;

htmlFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace old footer with unified footer
  content = content.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, footerHTML);
  
  // Fallback if no footer was present
  if (!content.includes('class="site-footer"')) {
     content = content.replace('</body>', footerHTML + '\n</body>');
  }

  // Favicon
  if (!content.includes('favicon.svg')) {
     content = content.replace('</head>', '  <link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">\n</head>');
  }

  // Back to top button
  if (!content.includes('backToTop')) {
     content = content.replace('</body>', '  <button id="backToTop" class="btn btn-primary" aria-label="Retour en haut"><i class="ph-bold ph-arrow-up" aria-hidden="true"></i></button>\n</body>');
  }

  // Replace old Fontawesome Nav to include bracket
  if (content.includes('id="mainNav"')) {
     if (!content.includes('bracket.html')) {
        content = content.replace('<a href="classement.html">', '<a href="bracket.html"><i class="ph-bold ph-git-fork" aria-hidden="true"></i> Arbre</a>\n      <a href="classement.html">');
     }
  }

  fs.writeFileSync(f, content, 'utf8');
});

console.log("Footer, Favicon, BackToTop unified across all HTML files.");
