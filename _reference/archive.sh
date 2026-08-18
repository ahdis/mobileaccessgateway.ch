#!/usr/bin/env bash
# Archives the original Squarespace site (pages + assets + css) before decommissioning.
# Re-runnable; overwrites into _reference/squarespace/.
set -euo pipefail
BASE="https://www.mobileaccessgateway.ch"
OUT="$(cd "$(dirname "$0")" && pwd)/squarespace"
mkdir -p "$OUT"/pages "$OUT"/assets "$OUT"/css "$OUT"/extracted "$OUT"/fonts

PAGES="index:/ contributors:/contributors contact:/contact privacy-policy:/privacy-policy"

for entry in $PAGES; do
  name="${entry%%:*}"; path="${entry#*:}"
  curl -sSL --compressed -o "$OUT/pages/$name.html" "$BASE$path"
  printf '%-16s %8s bytes\n' "$name.html" "$(wc -c < "$OUT/pages/$name.html" | tr -d ' ')"
done

# Collect every Squarespace-hosted asset referenced by any page, download at max resolution.
grep -ohE "https://(images|file)\.squarespace-cdn\.com/content/[^\"'?&)\\ ]*" \
  "$OUT"/pages/*.html | sort -u > "$OUT/assets/SOURCES.txt"

while read -r url; do
  [ -z "$url" ] && continue
  fn="$(basename "$url")"
  # font files all share names (latin.woff2 etc); disambiguate with their asset UUID
  case "$url" in *file.squarespace-cdn.com*) fn="$(basename "$(dirname "$url")")-$fn" ;; esac
  case "$url" in
    *images.squarespace-cdn.com*) q="?format=2500w"; dir="$OUT/assets" ;;
    *)                            q="";             dir="$OUT/fonts"  ;;
  esac
  mkdir -p "$dir"
  code=$(curl -sSL -o "$dir/$fn" -w '%{http_code}' "$url$q")
  printf '  %s %8s  %s\n' "$code" "$(wc -c < "$dir/$fn" | tr -d ' ')" "${dir##*/}/$fn"
done < "$OUT/assets/SOURCES.txt"

# Theme CSS (the 1.2MB framework + the custom overrides) -- reference only, not shipped.
curl -sSL --compressed -o "$OUT/css/site.css" \
  "https://static1.squarespace.com/static/versioned-site-css/63d2950cdd31af2a18b6b27e/35/5c5a519771c10ba3470d8101/63d2950ddd31af2a18b6b2a9/1816/site.css?nocustom=true"
curl -sSL --compressed -o "$OUT/css/custom.css" \
  "https://static1.squarespace.com/static/custom-css/63d2950cdd31af2a18b6b27e/63d2950ddd31af2a18b6b2a9/0/custom.css"

# Per-page inline <style> blocks -- this is where the Fluid Engine grid layouts live.
python3 - "$OUT" <<'PY'
import re,sys,glob,os
out=sys.argv[1]
for p in sorted(glob.glob(os.path.join(out,'pages','*.html'))):
    name=os.path.basename(p)[:-5]
    css="\n\n/* ---- */\n\n".join(re.findall(r'<style[^>]*>(.*?)</style>', open(p,encoding='utf-8').read(), re.S))
    open(os.path.join(out,'extracted',f'{name}.inline.css'),'w',encoding='utf-8').write(css)
    print(f'  extracted {name}.inline.css  {len(css)} bytes')
PY
echo "archive complete: $OUT"
