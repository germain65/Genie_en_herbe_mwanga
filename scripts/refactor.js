const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<link rel="stylesheet" href="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/font-awesome\/6.5.0\/css\/all.min.css">/g, '<script src="https://unpkg.com/@phosphor-icons/web"></script>');
    
    const mapping = {
        'fa-house': 'ph-bold ph-house',
        'fa-graduation-cap': 'ph-duotone ph-graduation-cap',
        'fa-circle-info': 'ph-bold ph-info',
        'fa-clock-rotate-left': 'ph-bold ph-clock-counter-clockwise',
        'fa-table-list': 'ph-bold ph-list-numbers',
        'fa-play': 'ph-bold ph-play',
        'fa-arrow-right': 'ph-bold ph-arrow-right',
        'fa-angle-right': 'ph-bold ph-caret-right',
        'fa-archive': 'ph-bold ph-archive-box',
        'fa-box-archive': 'ph-duotone ph-archive-box',
        'fa-calendar-check': 'ph-duotone ph-calendar-check',
        'fa-users': 'ph-duotone ph-users-three',
        'fa-bolt': 'ph-duotone ph-lightning',
        'fa-brain': 'ph-duotone ph-brain',
        'fa-globe': 'ph-duotone ph-globe',
        'fa-handshake-angle': 'ph-duotone ph-handshake',
        'fa-trophy': 'ph-duotone ph-trophy',
        'fa-star': 'ph-bold ph-star',
        'fa-award': 'ph-duotone ph-medal',
        'fa-crown': 'ph-duotone ph-crown',
        'fa-arrow-trend-up': 'ph-duotone ph-trend-up',
        'fa-arrows-left-right': 'ph-duotone ph-arrows-out-line-horizontal',
        'fa-download': 'ph-bold ph-download-simple',
        'fa-file-pdf': 'ph-light ph-file-pdf',
        'fa-book-open': 'ph-light ph-book-open',
        'fa-image': 'ph-light ph-image',
        'fa-address-card': 'ph-duotone ph-address-book',
        'fa-medal': 'ph-duotone ph-medal',
        'fa-envelope': 'ph-light ph-envelope',
        'fa-location-dot': 'ph-light ph-map-pin',
        'fa-chart-simple': 'ph-duotone ph-chart-bar',
        'fa-list-ol': 'ph-duotone ph-list-numbers',
        'fa-shield-halved': 'ph-duotone ph-shield-check',
        'fa-triangle-exclamation': 'ph-duotone ph-warning',
        'fa-spinner': 'ph-bold ph-spinner-gap',
        'fa-spin': 'ph-spin',
        'fa-solid': '',
        'fa-regular': '',
        'fa-3x': 'fa-3x',
        'fa-lg': 'fa-lg'
    };
    
    for (let key in mapping) {
        let regex = new RegExp(key, 'g');
        content = content.replace(regex, mapping[key]);
    }
    
    // Cleanup double spaces
    content = content.replace(/class="\s+/g, 'class="');
    content = content.replace(/\s+"/g, '"');
    content = content.replace(/  +/g, ' ');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Phosphor replacement complete.');
