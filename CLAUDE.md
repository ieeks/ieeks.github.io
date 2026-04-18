# ieeks.github.io — v2 Redesign Handoff

## Projekt-Ziel
Redesign der bestehenden Landing Page `ieeks.github.io` als **v2**.
Kein Framework, kein Build-Step — exakt wie bisher: `index.html` + `styles.css` + `script.js`.

## Bestehende Dateistruktur beibehalten
```
index.html    ← Seitenstruktur
styles.css    ← Layout, Theme, Responsive
script.js     ← Dark Mode Toggle, Live-Uhrzeit, Scramble-Effekt
```

## Was sich ändert (v2)
- Komplett neues Design nach ukint-vs.github.io Design-System (siehe unten)
- Neuer Scramble-Effekt auf dem Heading
- iOS-inspirierte Tool-Kacheln
- Neuer Footer mit Live-Uhrzeit Wien

---

## Design System

### CSS Custom Properties

**Light Mode (`:root`):**
```css
--bg: #f6f4f0
--bg-warm: #eee9e2
--bg-card: #ffffff
--text: #1a1a1a
--text-secondary: #5a5550
--text-tertiary: #8a847d
--border: #d8d2ca
--border-light: #e8e3dc
--accent: #c44b28        /* Terrakotta */
--accent-soft: rgba(196, 75, 40, 0.07)
--accent-border: rgba(196, 75, 40, 0.22)
--ink: #2c2926
```

**Dark Mode (`[data-theme="dark"]`):**
```css
--bg: #2b2e33
--bg-warm: #333740
--bg-card: #32363d
--text: #e0ddd8
--text-secondary: #a8a29e
--text-tertiary: #8a847d
--border: #3e4249
--border-light: #353940
--accent: #00d2ff        /* Cyan */
--accent-soft: rgba(0, 210, 255, 0.09)
--accent-border: rgba(0, 210, 255, 0.25)
--ink: #f6f3f3
```

### Fonts (Google Fonts)
- **Body/UI:** `Instrument Sans` (400, 500, 600)
- **Mono:** `IBM Plex Mono` (300, 300i, 400, 500)
- **Serif:** `Source Serif 4` (300, 400, 300i) — nur für Blog falls vorhanden

### Max-width: 720px, padding: 0 2rem (mobile: 0 1.2rem)

---

## Dark Mode

Theme via `data-theme` Attribut auf `<html>`.
**Kritisch:** Init-Script muss das ERSTE im `<head>` sein (vor CSS) um FOUC zu vermeiden:

```js
(function() {
  var saved;
  try { saved = localStorage.getItem('theme'); } catch(e) {}
  if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();
```

Toggle-Funktion:
```js
function toggleTheme() {
  var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e) {}
}
```

---

## Seiten-Struktur

### Nav
- Links: SVG-Logo (`ie` in einem Quadrat, `currentColor`)
- Rechts: `tools` Link, `github` Link, Dark Mode Toggle Button (Mond/Sonne SVG)

### Intro / Hero
- Eyebrow: `MANUEL · VIENNA` (IBM Plex Mono, 0.7rem, uppercase, text-tertiary)
- **Heading: Scramble-Effekt** (siehe unten) — `personal toolbox~`
- Bio-Text: Instrument Sans, 0.97rem, text-secondary

### Tools Grid (2×2, mobile 1×4)
4 Kacheln als `<a>`-Tags:

| Emoji | Name | Type | URL | Status |
|-------|------|------|-----|--------|
| 🧾 | VAT Calculator | EU Tax · Reihengeschäft | `/vat` | live |
| ⚡ | Ladefuchs | EV Charging · Firebase | `/wallbox` | live |
| 🧱 | LEGO Tracker | Family · Wishlist | `/lego` | live |
| 📊 | Energy Dashboard | Home · Analytics | `/energy` | in progress |
| 📋 | Sublist | Personal · Subscription Tracking | `/sublist-web` | in progress |

**Kachel-Design:**
- `background: var(--bg-card)`, `border: 1px solid var(--border-light)`
- `border-radius: 20px`, `padding: 1.8rem 1.6rem 1.5rem`, `min-height: 190px`
- Hover: `translateY(-3px) scale(1.01)`, `box-shadow: 0 8px 28px rgba(0,0,0,0.08)`
- Hover: farbiger 3px Top-Stripe (`--tool-color`) erscheint
- Per-Kachel Stripe-Farben: VAT `#c44b28`, Ladefuchs `#22c55e`, LEGO `#f59e0b`, Energy `#6366f1`
- Status-Dot: grün (`#22c55e`) = live, amber (`#f59e0b`) = in progress
- ↗ Arrow erscheint bei Hover (opacity 0 → 1)

### Stack-Block
- `background: var(--bg-warm)`, border-radius 10px
- Label: `STACK` (mono, uppercase, text-tertiary)
- Text mit `<code>`-Inline-Chips

### Footer (3-spaltig)
- Links: `Vienna, AT · HH:MM CET` (Live-Uhrzeit!) + `built for everyday life`
- Mitte: `ie`-Monogram Box + `© 2026`
- Rechts: GitHub + Mail Links mit SVG-Icons
- Unten: `↑ back to top` Link

---

## Scramble-Effekt (WICHTIG)

Für `personal toolbox~` Heading — **kein Canvas, reines JS auf dem `<h1>`**.

```js
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*~+-=.:';
const DURATION = 650;

function scramble(el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const final = el.getAttribute('data-text') || el.textContent || '';
  el.setAttribute('data-text', final);
  el.style.minWidth = el.offsetWidth + 'px';

  const start = performance.now();
  let running = true;

  (function tick(now) {
    const progress = Math.min((now - start) / DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const resolved = Math.floor(eased * final.length);

    let out = '';
    for (let i = 0; i < final.length; i++) {
      if (i < resolved) out += final[i];
      else if (final[i] === ' ') out += ' ';
      else out += POOL[Math.floor(Math.random() * POOL.length)];
    }
    el.textContent = out;

    if (progress < 1) requestAnimationFrame(tick);
    else {
      el.textContent = final;
      el.style.minWidth = '';
    }
  })(start);
}
```

**Trigger:**
- `astro:page-load` → beim ersten Load + bei View Transitions
- Zusätzlich: `mouseenter` und `touchstart` auf dem Element

---

## Datei-Aufteilung

**`index.html`** — nur Struktur, keine Inline-Styles, keine Inline-Scripts außer dem Dark-Mode-Init-Script (muss als erstes im `<head>` stehen).

**`styles.css`** — alle CSS Custom Properties, Reset, Layout, Komponenten, Dark Mode, Responsive.

**`script.js`** — Dark Mode Toggle, Live-Uhrzeit, Scramble-Effekt. Wird am Ende von `<body>` eingebunden.

**`<head>`-Reihenfolge in index.html:**
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ieeks — Manuel's Tools</title>
  <!-- 1. Dark Mode Init — MUSS vor CSS kommen, blocking -->
  <script>
    (function() {
      var saved;
      try { saved = localStorage.getItem('theme'); } catch(e) {}
      if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', saved);
    })();
  </script>
  <!-- 2. Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <!-- 3. CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
```

## GitHub Pages Deploy
Kein Build-Step. `index.html` direkt im Root → GitHub Pages served es automatisch.

---

## Was NICHT geändert werden soll

- Die Farbwerte der Design Tokens (exakt wie oben)
- Dark Mode Accent bleibt `#00d2ff` (nicht zurück zu Orange)
- Das `ie`-Logo bleibt als inline SVG mit `currentColor`
- Scramble läuft auf dem Text-`<h1>`, KEIN Canvas für den Heading
