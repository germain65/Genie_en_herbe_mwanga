#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add hamburger button to all HTML files that have id="mainNav" but no hamburgerBtn.
The button is inserted BEFORE the <nav class="main-nav" id="mainNav"> element.
Also fixes header-inner inline styles to be consistent.
"""

import os
import re

HTML_DIR = os.path.dirname(os.path.abspath(__file__))

HAMBURGER_BTN = '''<button class="hamburger" id="hamburgerBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mainNav">
  <i class="ph-bold ph-list" id="hamburgerIcon"></i>
</button>'''

html_files = [f for f in os.listdir(HTML_DIR) if f.endswith('.html') and f != '404.html']

for fname in html_files:
    fpath = os.path.join(HTML_DIR, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'id="mainNav"' not in content:
        print(f'SKIP {fname} — no mainNav')
        continue

    if 'hamburgerBtn' in content:
        print(f'SKIP {fname} — hamburgerBtn already present')
        continue

    # Insert hamburger button before <nav class="main-nav" id="mainNav">
    # Pattern handles various whitespace/attribute orderings
    new_content = re.sub(
        r'(<nav\b[^>]*\bid=["\']mainNav["\'][^>]*>)',
        HAMBURGER_BTN + '\n  \\1',
        content,
        count=1
    )

    if new_content == content:
        print(f'WARNING {fname} — pattern not matched')
        continue

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'OK {fname} — hamburger button added')

print('\nDone.')
