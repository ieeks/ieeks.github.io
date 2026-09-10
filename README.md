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
- `CNAME` — custom domain

## Features

- **Dark mode** via `data-theme` on `<html>`, persisted in `localStorage`,
  defaulting to `prefers-color-scheme`. The init script is inlined first in
  `<head>` so there is no flash of the wrong theme.
- **Tool filter** — category pills (`all`/`tax`/`money`/`family`/`home`/`dev`)
  driven by `data-cat` on the cards, with a live count.
- **Scramble heading** — plain JS on the `<h1>`, skipped under
  `prefers-reduced-motion`.
- **Live clock** for Vienna, including the correct CET/CEST abbreviation.

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
