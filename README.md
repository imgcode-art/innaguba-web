# Inna Guba — Studio (agency concept)

Statický HTML/CSS/JS koncept homepage, postavený podle Figma reference
(agenturní layout: hero, Práce, Služby, Reference, Kontakt).

## Struktura

```
index.html      — struktura stránky
css/style.css    — veškeré styly
js/script.js     — accordion u služeb + reveal-on-scroll animace
```

Žádné build nástroje, žádné závislosti — čisté HTML/CSS/JS. Fonty (Archivo)
se načítají z Google Fonts přes `<link>` v `<head>`.

## Jak si to otevřít na Macu

1. Rozbal ZIP kamkoliv (např. do `~/Projects/innaguba-agency`).
2. Dvojklikem na `index.html` se otevře v prohlížeči — funguje i bez serveru.

## Jak pokračovat v Claude Code (terminál)

```bash
cd ~/Projects/innaguba-agency   # nebo kam jsi to rozbalila
claude
```

Pak stačí normálně psát požadavky, např.:
- "uprav barvu pozadí na..."
- "přidej sekci FAQ za Service"
- "nastav lokální server, ať to vidím live"

Pro živý náhled se změnami za běhu se hodí jednoduchý statický server, např.:

```bash
python3 -m http.server 8000
# pak otevři http://localhost:8000 v prohlížeči
```

## Poznámka k obsahu

Fotografická část (Práce, Reference, texty) používá reálné texty a fotky
z innaguba.com. Větev "Webdesign & branding" je zatím označená jako
"připravuje se" — až budou první reálné weby/reference, je potřeba tenhle
obsah doplnit ručně v `index.html` (sekce `#sluzby`, řádek 03) a v gridu
"Práce" (dlaždice `.tile.mock`).

Fotky se aktuálně natahují přímo z CDN současného webu (Vigbo) — pro
produkční nasazení je vhodné je stáhnout a nahradit lokálními soubory ve
vyšším rozlišení.
