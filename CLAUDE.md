# ieeks.github.io — Landing Page

## Projekt-Ziel
Statische persönliche Landing Page, die unter **`manuel.tools`** ausgeliefert wird
(siehe `CNAME`). Kein Framework, kein Build-Step, keine Dependencies —
drei Dateien, die man direkt im Browser öffnen kann.

## Dateistruktur
```
index.html    ← Seitenstruktur
styles.css    ← Tokens, Layout, Komponenten, Dark Mode, Responsive
script.js     ← Dark Mode Toggle, Live-Uhrzeit, Scramble-Effekt, Tool-Filter
CNAME         ← manuel.tools
apple-touch-icon.png
```

Es gibt **keine** Design-Varianten mehr. Frühere Versionen dieses Repos hatten
drei parallele Designs (`data-design="v1|v2|v3"`) mit einem Umschalter unten auf
der Seite. Das ist entfernt — das ehemalige **v2 („Trimmy")** ist jetzt das
einzige Design und liegt direkt in der Basis, ohne `[data-design]`-Selektoren.
Bitte keine neue Varianten-Ebene wieder einführen.

---

## Design System

Harte Konturen, versetzter Farbschatten statt Weichzeichnung, Grain-Overlay,
Crop-Marks in den oberen Ecken — Print-/Riso-Anmutung.

### CSS Custom Properties

**Light Mode (`:root`):**
```css
--bg: #eee8db
--bg-warm: #e8e2d5
--bg-card: #ffffff
--text: #1a1a1a
--text-secondary: #5a5550
--text-tertiary: #8a847d
--border: #d8d2ca
--border-light: #e8e3dc
--border-hard: #1a1a1a       /* harte Kontur Kacheln + Filter-Pills */
--accent: #c44b28            /* Terrakotta */
--accent-soft: rgba(196, 75, 40, 0.07)
--accent-border: rgba(196, 75, 40, 0.22)
--on-accent: #ffffff         /* Text auf accent-gefüllter Fläche */
--ink: #2c2926
```

**Dark Mode (`[data-theme="dark"]`):**
```css
--bg: #1e2024
--bg-warm: #23272d
--bg-card: #32363d
--text: #e0ddd8
--text-secondary: #a8a29e
--text-tertiary: #8a847d
--border: #3e4249
--border-light: #353940
--border-hard: #4a4540
--accent: #00d2ff            /* Cyan */
--accent-soft: rgba(0, 210, 255, 0.09)
--accent-border: rgba(0, 210, 255, 0.25)
--on-accent: #1e2024
--ink: #f6f3f3
```

`--border-hard` und `--on-accent` existieren, damit Kachel-Kontur und
Pill-Beschriftung in beiden Themes aus einem Token kommen. Vorher standen
`#1a1a1a` / `#4a4540` / `#c44b28` / `#00d2ff` in acht Regeln hardcodiert.
Der versetzte Schatten ist immer `var(--accent)`.

### Fonts (Google Fonts)
- **Body/UI:** `Instrument Sans` (400, 500, 600)
- **Mono:** `IBM Plex Mono` (300, 300i, 400, 500)

Kein Serif-Font. `Fraunces` wurde mit v3 entfernt — falls es je zurückkommt,
bitte nicht mit allen vier Variable-Axes in Roman *und* Italic laden.

### Maße
Max-width **720px**, Padding `0 2rem` (mobil `0 1.2rem`), `--radius-card: 20px`.

---

## Dark Mode

Theme via `data-theme` Attribut auf `<html>`.
**Kritisch:** Init-Script muss das ERSTE im `<head>` sein (vor CSS), um FOUC zu vermeiden:

```js
(function() {
  var saved;
  try { saved = localStorage.getItem('theme'); } catch(e) {}
  if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();
```

`localStorage` immer in `try/catch` — sonst wirft es im Private Mode und bei
blockierten Site-Daten.

---

## Seiten-Struktur

### Nav
- Links: SVG-Logo (`ie` in einem Quadrat, `currentColor`)
- Rechts: `tools` Link, `github` Link, Dark Mode Toggle Button (Mond/Sonne SVG)

### Intro / Hero
- Eyebrow: `MANUEL · VIENNA` (IBM Plex Mono, 0.7rem, uppercase, text-tertiary)
- **Heading: Scramble-Effekt** — `personal toolbox~`, ein `<h1>` mit
  `data-scramble` + `data-text`
- Bio-Text: Instrument Sans, 0.97rem, text-secondary

### Tool-Filter
Pills über `data-cat` auf den Karten, mit Live-Counter (`#tool-count`,
`aria-live="polite"`). Kategorien: `all` · `tax` · `money` · `family` · `home` · `dev`.
Eine Karte kann mehrere Kategorien tragen (space-separiert, z. B. `data-cat="tax family"`).
`aria-pressed` wird von `applyFilter()` gesetzt und ist zugleich der CSS-Hook
für den aktiven Zustand.

### Tools Grid (2 Spalten, ≤520px einspaltig)

Aktuell 12 Karten als `<a>`-Tags. Alle Links zeigen auf `manuel.tools/…` —
nicht auf `ieeks.github.io/…`, das wäre ein zusätzlicher Redirect-Hop.

| Name | Type | Pfad | Status | `data-cat` |
|------|------|------|--------|-----------|
| VAT Calculator | EU Tax · Reihengeschäft | `/eu-vat-reihengeschaeftrechner/` | live | `tax` |
| Wallbox | EV Charging · Firebase | `/wallbox/` | live | `home` |
| LEGO Tracker | Family · Wishlist | `/lego-tracker/` | live | `family` |
| Energy Dashboard | Home · Analytics | `/gmail-pdf-sync/` | live | `home` |
| Sublist | Personal · Subscription Tracking | `/sublist-web/` | live | `money` |
| Familienbonus | AT Steuer · Aufteilungsrechner | `/familienbonus/` | live | `tax family` |
| Ortstaxe Wien | AT Steuer · Airbnb Meldung | `/ortstaxe-wien/` | live | `tax money` |
| ETF Rechner | Invest · Sparplan Kalkulator | `/etf-rechner/` | live | `money` |
| Finance Dashboard | Banking · PDF Import · AI | `/finance-dashboard/` | in progress | `money` |
| Wanderly | Family · Travel Dashboard | `/wanderly/` | live | `family` |
| API Key Manager | Dev · Key Vault | `/apikey-app/` | in progress | `dev` |
| SnipVault | Dev · Snippet Manager | `/snipvault/` | live | `dev` |

> **Achtung, sieht wie ein Bug aus, ist keiner:** „Energy Dashboard" zeigt auf
> `/gmail-pdf-sync/`. Ein Repo `energy-dashboard` existiert nicht — das Tool
> liegt im Repo `ieeks/gmail-pdf-sync` (es zieht die Energieabrechnungen als
> PDF aus Gmail). Bitte nicht „korrigieren".

**Kachel-Design:**
- `background: var(--bg-card)`, `border: 2px solid var(--border-hard)`
- `border-radius: 20px`, `padding: 1.8rem 1.6rem 1.5rem`
- `box-shadow: 3px 3px 0 var(--accent)` (versetzter harter Schatten)
- Hover: `translate(-1px, -1px)` + Schatten auf `5px 5px 0`
- Active: zurück auf `translate(0, 0)` + `3px 3px 0`
- Status-Dot: grün (`#22c55e`) = live, amber (`#f59e0b`) = in progress
- ↗ Arrow erscheint bei Hover (opacity 0 → 1)
- Rise-Animation `card-rise` mit 45ms-Staffelung über `--i`, das
  `applyFilter()` beim Rendern setzt. Unter `prefers-reduced-motion` aus.
- Jede Karte braucht `target="_blank" rel="noreferrer"`.

Es gibt **keine** Per-Kachel-Farben mehr. Die früheren `--tool-color`-Regeln
gehörten zum Farbstreifen von v1/v3; v2 hat statt eines Streifens den
versetzten Schatten, der einheitlich `--accent` nutzt.

### Stack-Block
- `background: var(--bg-warm)`, border-radius 10px
- Label: `STACK` (mono, uppercase, text-tertiary)
- Text mit `<code>`-Inline-Chips

### Footer (3-spaltig)
- Links: `Vienna, AT · HH:MM CEST` + `built for everyday life`
  Uhrzeit **und** Zonenkürzel sind live (`#current-time`, `#current-tz`).
- Mitte: `ie`-Monogram Box + `© <Jahr>` (`#current-year`, aus `Date`)
- Rechts: GitHub + Mail Links mit SVG-Icons
- Unten: `↑ back to top` Link

### Overlays
`.grain` (SVG `feTurbulence`, fixed, `opacity: 0.25`) und die beiden
`.crop-mark`-Kreuze oben. Beide immer sichtbar — früher waren sie v2-exklusiv.

---

## Live-Uhrzeit

Wien ist von Ende März bis Ende Oktober **CEST**, nicht CET. Das Kürzel wird
darum mitformatiert und nicht ins HTML geschrieben:

```js
var clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Vienna',
  hour: '2-digit', minute: '2-digit', hour12: false,
  timeZoneName: 'short'
});
```

`formatToParts()` liefert `hour`/`minute` und `timeZoneName` getrennt
(`en-GB` → `CET`/`CEST`; eine deutsche Locale gäbe `MEZ`/`MESZ`).

Der Tick stellt sich nach jedem Lauf selbst neu auf die nächste Minutengrenze
(`scheduleClock()` mit `setTimeout`, nicht `setInterval`) — damit driftet die
Anzeige nicht und ist nie älter als die laufende Minute.

---

## Scramble-Effekt

Für das `personal toolbox~` Heading — **kein Canvas, reines JS auf dem `<h1>`**.

Läuft über *alle* `[data-scramble]`-Elemente gleichzeitig; aktuell ist das nur
das `<h1>`, die Schleife bleibt aber generisch.

Wichtige Details:
- `isScrambling`-Guard, damit sich schnelle Hovers nicht überlagern
- `prefers-reduced-motion: reduce` → gar nicht animieren
- `el.style.minWidth` wird auf die gemessene Breite gepinnt und am Ende
  wieder entfernt, sonst springt das Layout während des Laufs
- Leerzeichen bleiben Leerzeichen, sonst zerfällt die Wortgrenze

**Trigger:** `window load` (+120ms), zusätzlich `mouseenter` und `touchstart`
auf dem Heading. (Kein `astro:page-load` — hier läuft kein Astro.)

---

## Datei-Aufteilung

**`index.html`** — nur Struktur. Keine Inline-Styles. Kein Inline-Script außer
dem Dark-Mode-Init im `<head>`. Die Tool-URLs stehen hier, nicht in `script.js`.

**`styles.css`** — Custom Properties, Reset, Layout, Komponenten, Dark Mode, Responsive.

**`script.js`** — Theme-Toggle, Live-Uhrzeit, Scramble, Tool-Filter.
Wird am Ende von `<body>` eingebunden.

**`<head>`-Reihenfolge:** Init-Script → Fonts → CSS. Bei Änderungen an
`styles.css`/`script.js` den `?v=`-Query in `index.html` mitziehen, sonst
bekommen wiederkehrende Besucher eine gemischte Version.

---

## GitHub Pages Deploy
Kein Build-Step. `index.html` im Root → wird direkt ausgeliefert.

Die Tools liegen alle in **eigenen Repos** und werden als Project Pages unter
`manuel.tools/<repo>/` ausgeliefert. Dieses Repo enthält nur die Landing Page —
bitte keine Tool-Kopien als Unterordner hier einchecken.

---

## Was NICHT geändert werden soll

- Die Farbwerte der Design Tokens (exakt wie oben)
- Dark Mode Accent bleibt `#00d2ff` (nicht zurück zu Orange)
- Das `ie`-Logo bleibt als inline SVG mit `currentColor`
- Scramble läuft auf dem Text-`<h1>`, KEIN Canvas für den Heading
- Kein Build-Step, keine Dependencies, keine `[data-design]`-Varianten

## Offen / bekannte Schwächen

Aus dem letzten Review noch nicht umgesetzt:
- **Accessibility:** `--text-tertiary` reißt AA (3.0–3.7:1 je Theme);
  `:focus-visible` ist nirgends definiert; Touch-Targets in der Nav sind
  bei 375px nur 15px hoch; `lang="de"`, aber Hero und Bio sind Englisch;
  `user-select: none` auf dem `<h1>`
- **`<head>`:** kein `<link rel="icon">` (`/favicon.ico` → 404), kein
  `theme-color`, keine Open-Graph-/Canonical-Tags
- **Theme:** OS-Wechsel greift erst beim Reload (kein `matchMedia`-Listener),
  und nach dem ersten manuellen Toggle gibt es kein Zurück auf „System"
- `onclick="toggleTheme()"` ist das einzige Inline-Handler-Relikt
- `.grain` ist ein Viewport-großer `feTurbulence`-Filter — auf Mobile teuer;
  ein vorgerendertes getiltes PNG wäre günstiger
- Keine CI: ein Link-Checker und ein HTML-Validator auf Push wären hier
  am wirksamsten
