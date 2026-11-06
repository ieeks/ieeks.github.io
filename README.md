# ieeks.github.io

Static personal landing page, served at **[manuel.tools](https://manuel.tools)**
(see `CNAME`). It lists the tools I built for myself, including
work-in-progress ones.

## Stack

- HTML
- CSS
- Vanilla JavaScript

No framework, no build step, no dependencies.

## Files

- `index.html` — page structure and the tool cards (this is where the tool URLs live)
- `styles.css` — design tokens, layout, components, dark mode, responsive
- `script.js` — dark mode toggle, live Vienna clock, scramble heading, tool filter
- `favicon.svg` — tab icon, follows the browser's light/dark setting
- `CNAME` — custom domain

## Features

- **Dark mode** via `data-theme` on `<html>`, persisted in `localStorage`,
  defaulting to `prefers-color-scheme`. The init script is inlined first in
  `<head>` so there is no flash of the wrong theme.
- **Tool filter** — category pills (`all`/`tax`/`money`/`family`/`home`/`dev`)
  driven by `data-cat` on the cards, with a live count.
- **Personal tool order** — cards are sorted by your locally saved click counts on page load. Ties keep the HTML order. Normal clicks, touch/Enter activation, Ctrl/Cmd-click and middle-click count; right-click does not. Cards stay in place while clicking or filtering. Counts start with this feature and are stored only in this browser under `toolbox:tool-clicks:v1`; there is no device sync or server analytics. Clearing site data resets the order. If storage is unavailable, links and filters still work.
- **Scramble heading** — plain JS on the `<h1>`, skipped under
  `prefers-reduced-motion`.
- **Live clock** for Vienna, including the correct CET/CEST abbreviation.
- **Share previews** — Open Graph tags, so pasting the link into a chat shows a
  card instead of a bare URL. The mobile browser bar is tinted to match the
  active theme via `theme-color`.

## Local use

Open `index.html` directly in a browser, or serve the folder with any static
server:

```sh
npx http-server -p 8080 -c-1 .
```

## Deployment

GitHub Pages compatible as-is — no build step. Pushing to the default branch
publishes it.

The tools themselves live in their own repositories and are served as project
pages under `manuel.tools/<repo>/`. This repository holds only the landing page.

## Contributing notes

See `CLAUDE.md` for the design tokens, the page structure, and the list of
known open issues.

### mietklar.

[mietklar.](https://manuel.tools/mietklar/) is listed in the tax and money filters (live alpha). Its source and deployment remain in [`ieeks/mietklar`](https://github.com/ieeks/mietklar); this landing page links directly to its project page.

### Mobile rendering

On touch devices (no hover) and viewports up to 768px, the full-screen grain filter is hidden and tool cards appear without entrance animation. Desktop effects remain available. This reduces rendering effects; actual iPhone scrolling should be checked on-device.

### Filament Shelf

[Filament Shelf](https://manuel.tools/filament-shelf/) is listed in the home filter, at Sublist's former position in the default HTML order. Sublist is the last tool card in that default order; local click counts can move either card up. Filament Shelf's source and deployment remain in [`ieeks/filament-shelf`](https://github.com/ieeks/filament-shelf).

### Click ranking checks

Run `node --test tests/tool-ranking.test.cjs` with Node.js. The dependency-free checks execute the page script against a minimal DOM/storage fixture and cover ranking, ties, activation types, filtering, invalid data, blocked storage and cross-tab rereads. They are functional checks, not a full browser test.

### Vienna Christmas Markets

[Vienna Christmas Markets 2026](https://manuel.tools/xmas/) is listed in the family filter. The guide lives in [`ieeks/xmas`](https://github.com/ieeks/xmas), published from the root `index.html` through GitHub Pages. The card uses the existing local click ranking.
