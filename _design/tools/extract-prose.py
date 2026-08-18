#!/usr/bin/env python3
"""Emit the clean prose HTML of every text block, so page copy is transcribed
from the original rather than retyped."""
import re, os, sys, json

def blocks_of(path):
    src = open(path, encoding='utf-8').read()
    for m in re.finditer(r'<div class="sqs-html-content"[^>]*>', src):
        i, depth, j = m.end(), 1, m.end()
        while j < len(src) and depth:
            nd, nc = src.find('<div', j), src.find('</div>', j)
            if nc == -1: break
            if nd != -1 and nd < nc: depth += 1; j = nd + 4
            else: depth -= 1; j = nc + 6
        yield src[i:j-6]

def clean(h):
    h = re.sub(r'<style.*?</style>', '', h, flags=re.S)
    h = re.sub(r'\s+style="[^"]*"', '', h)
    h = re.sub(r'\s+class=""', '', h)
    h = re.sub(r'\s+data-[\w-]+(="[^"]*")?', '', h)
    h = re.sub(r'<span>(.*?)</span>', r'\1', h, flags=re.S)
    h = re.sub(r'\s+', ' ', h)
    h = re.sub(r'>\s+<', '><', h)
    return h.strip()

page = sys.argv[1]
for i, b in enumerate(blocks_of(f'_reference/squarespace/pages/{page}.html')):
    c = clean(b)
    if c: print(f"\n### [{i}]\n{c}")
