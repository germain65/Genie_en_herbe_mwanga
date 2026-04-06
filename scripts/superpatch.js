const fs = require('fs');

// 1. Write sitemap & robots
const sitemap = <?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://geh-imgoma.github.io/index.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/archives.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/bracket.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/classement.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/contact.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/palmares.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/presentation.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/reglement.html</loc></url>
  <url><loc>https://geh-imgoma.github.io/statistiques.html</loc></url>
</urlset>;
fs.writeFileSync('sitemap.xml', sitemap, 'utf8');

const robots = User-agent: *
Allow: /
Disallow: /404.html
Sitemap: https://geh-imgoma.github.io/sitemap.xml;
fs.writeFileSync('robots.txt', robots, 'utf8');

// 2. Patch HTMLs
const htmls = fs.readdirSync('.').filter(f => f.endsWith('.html'));
htmls.forEach(f => {
   let content = fs.readFileSync(f, 'utf8');
   
   // Cleanup old cursor stuff and re-inject exactly at top of body, alongside noscript
   content = content.replace(/<div id="custom-cursor"><\/div>/g, '');
   content = content.replace(/<div class="cursor"><\/div>[\s\n]*<div class="cursor-follower"><\/div>/g, '');
   content = content.replace(/<body[^>]*>/, $&
<div class="cursor"></div>
<div class="cursor-follower"></div>
<noscript>
   <div style="background:#cc1f2d; color:#fff; text-align:center; padding:1rem; position:fixed; top:0; left:0; width:100%; z-index:999999;">
      Javscript est désactivé. Veuillez l'activer pour une expérience optimale du championnat.
   </div>
</noscript>);

   // SEO & head elements
   if(!content.includes('theme-color')) {
      content = content.replace('</head>',   <meta name="theme-color" content="#0F1E3A">
  <link rel="canonical" href="https://geh-imgoma.github.io/">
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Syne:wght@600;700;800&display=swap" as="style">
</head>);
   }
   
   // Target blank missing noopener
   content = content.replace(/target="_blank"(?! rel="noopener noreferrer")/g, 'target="_blank" rel="noopener noreferrer"');
   
   // Width/height + Alt mapping for images
   content = content.replace(/<img(.*?)>/g, (match, inner) => {
      let attrs = inner;
      if (!inner.includes('alt=')) attrs += ' alt=""';
      if (!inner.includes('width=')) {
          if (inner.includes('hero.jpg')) attrs += ' width="1920" height="1080"';
      }
      return <img>;
   });
   
   fs.writeFileSync(f, content, 'utf8');
});

// 3. Patch CSS
let css = fs.readFileSync('assets/css/main.css', 'utf8');

if (!css.includes('--color-surface: #F8F9FC;')) {
    css = css.replace(/--color-text-secondary:\s*[^;]+;/, '--color-text-secondary: #4A5778;');
    css = css.replace(/--color-surface:\s*[^;]+;/, '--color-surface: #F8F9FC;');
}

if(!css.includes(':focus-visible')) {
    css += \n/* Accessibility Focus */
:focus-visible { outline: 3px solid var(--color-gold) !important; outline-offset: 2px !important; }
;
}
fs.writeFileSync('assets/css/main.css', css, 'utf8');

// 4. Patch JS
let js = fs.readFileSync('assets/js/app.js', 'utf8');
js = js.replace(/console\.error\('Erreur lors de l\\'initialisation:', error\);/, console.error('Erreur lors de l\\'initialisation:', error);
      document.body.innerHTML += '<div style="position:fixed; bottom:20px; right:20px; background:#cc1f2d; color:#fff; padding:1rem; border-radius:8px; z-index:999999; box-shadow:0 4px 12px rgba(0,0,0,0.3);"><strong>Erreur de connexion :</strong> Impossible de charger les données du championnat. Veuillez actualiser la page ou vérifier votre réseau.</div>';);

fs.writeFileSync('assets/js/app.js', js, 'utf8');

console.log('Super patch ended');
