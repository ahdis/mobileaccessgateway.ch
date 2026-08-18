#!/usr/bin/env python3
"""Dump every Fluid Engine block with its type, content and both grid placements,
so the rebuild can be checked block-by-block against the original."""
import re, os, json, html, glob

REF  = '_reference/squarespace'
GRID = json.load(open('_design/tokens/grid.json'))

def clean(s):
    s = re.sub(r'<(script|style)\b.*?</\1>', '', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', ' / ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def block_html(page_src, block_id):
    """Return the innerHTML of the .sqs-block-content inside a given fe-block."""
    m = re.search(r'<div class="fe-block fe-block-%s">' % re.escape(block_id), page_src)
    if not m: return None
    i, depth, j = m.end(), 1, m.end()
    while j < len(page_src) and depth:
        nd = page_src.find('<div', j); nc = page_src.find('</div>', j)
        if nc == -1: break
        if nd != -1 and nd < nc: depth += 1; j = nd + 4
        else: depth -= 1; j = nc + 6
    return page_src[i:j-6]

out = {}
for page in ['index', 'contact', 'privacy-policy']:
    src = open(f'{REF}/pages/{page}.html', encoding='utf-8').read()
    g = GRID[page]
    blocks = []
    for bid, info in g['mobile'].items():
        if 'area' not in info: continue
        raw = bid[len('fe-block-'):]
        inner = block_html(src, raw) or ''
        btype = re.search(r'data-block-type="(\d+)"', inner)
        dname = re.search(r'data-definition-name="([^"]+)"', inner)
        imgs  = re.findall(r'data-src="([^"]+)"|<img[^>]+src="([^"]+)"', inner)
        imgs  = [a or b for a, b in imgs]
        links = re.findall(r'href="(https?://[^"]+|mailto:[^"]+|/[^"]*)"', inner)
        text  = clean(inner)
        blocks.append({
            'id': raw,
            'mobile': info['area'],
            'desktop': g['desktop'].get(bid, {}).get('area'),
            'type': dname.group(1) if dname else (btype.group(1) if btype else '?'),
            'images': sorted({os.path.basename(u.split('?')[0]) for u in imgs}),
            'links': sorted(set(links))[:6],
            'text': text[:300],
        })
    blocks.sort(key=lambda b: int(b['mobile'].split('/')[0]))
    out[page] = blocks

json.dump(out, open('_design/tokens/content.json', 'w'), indent=2)
for page, blocks in out.items():
    print(f"\n{'='*78}\n{page}  ({len(blocks)} blocks, in MOBILE order)\n{'='*78}")
    for b in blocks:
        print(f"\n[{b['mobile']:>13} -> {str(b['desktop']):>13}]  {b['type']}")
        if b['images']: print(f"   img   : {', '.join(b['images'])}")
        if b['links']:  print(f"   links : {', '.join(b['links'])}")
        if b['text']:   print(f"   text  : {b['text'][:190]}")
