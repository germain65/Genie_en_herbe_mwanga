const fs = require('fs');
['edition.html', 'match.html', 'equipe.html'].forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if(!content.includes('<div class="breadcrumb"')) {
     content = content.replace('<main>', '<main>\n  <div class="container" style="padding-top:2rem;"><div class="breadcrumb"></div></div>');
     fs.writeFileSync(f, content, 'utf8');
  }
});
