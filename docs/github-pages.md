# GitHub Pages static export

This repository can be published as a project site at:

`https://xiangwang2000.github.io/pokemon-go-retention-guide/`

## Build

Use the project-site base path when running a production build locally:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/pokemon-go-retention-guide"
$env:NEXT_PUBLIC_SITE_URL = "https://xiangwang2000.github.io/pokemon-go-retention-guide/"
npm run build:pages
```

The Pages build enables Next.js `output: "export"` through the project-site base-path
environment variable and writes only the static artifact to `out/`. The normal `npm run build`
and `npm run start` commands remain the Sites/Vinext runtime path; `npm run build:local` and
`npm run start:local` remain the Next.js Node fallback. Dynamic Pokémon routes are enumerated
with `generateStaticParams`; the browser then loads the
corresponding audit and family JSON files when a detail page opens.

## Browser data boundary

The application does not require Next.js route handlers at runtime. Browser loaders request:

- `/data/home.json`
- `/data/families/*.json`
- `/data/audit-summary.json`
- `/data/audit/*.json`
- `/data/details/*.json`
- `/data/review.json`, `/data/sources.json`, and `/data/changes.json`

Each data request includes the current `DATA_VERSION` as a query parameter. This is the cache
invalidation mechanism for GitHub Pages; it does not depend on response headers or a CDN purge API.

## Deployment

`.github/workflows/deploy-pages.yml` runs snapshot validation, lint, typecheck, tests, and the
static build on pushes to `main`. It uploads only `out/` with the official Pages artifact and
deploy actions. It does not create or update a `gh-pages` branch.

`public/_headers` and the Vinext worker remain legacy Sites artifacts for the existing Sites
runtime. The worker retains the old `/api/export` 307 redirect for that runtime only. GitHub
Pages does not rely on either the worker, `_headers`, or a server API route.
