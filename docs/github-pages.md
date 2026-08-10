# GitHub Pages static export

The canonical production site for this repository is:

`https://xiangwang2000.github.io/pokemon-go-retention-guide/`

GitHub Pages is the only supported production publishing target. Older Sites/Vinext files remain in the repository only as legacy migration and local research tooling; they are not part of the production artifact or deployment path.

## Build

Use the project-site base path when running a production build locally:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/pokemon-go-retention-guide"
$env:NEXT_PUBLIC_SITE_URL = "https://xiangwang2000.github.io/pokemon-go-retention-guide/"
npm run build:pages
npm run pages:verify
```

The Pages build enables Next.js `output: "export"` through the project-site base-path environment variable and writes only the static artifact to `out/`. Dynamic Pokémon routes are enumerated with `generateStaticParams`; the browser then loads the corresponding audit, detail, and family JSON files when a detail page opens.

## Browser data boundary

The application does not require Next.js route handlers at runtime. Browser loaders request:

- `/data/home.json`
- `/data/families/*.json`
- `/data/audit-summary.json`
- `/data/audit/*.json`
- `/data/details/*.json`
- `/data/review.json`, `/data/sources.json`, and `/data/changes.json`

Each data request includes the current `DATA_VERSION` as a query parameter. This is the cache invalidation mechanism for GitHub Pages; it does not depend on response headers or a CDN purge API.

## Deployment and verification

`.github/workflows/verify-pages-pr.yml` validates pull requests with snapshot checks, lint, typecheck, tests, the full static export, and `pages:verify` before merge.

`.github/workflows/deploy-pages.yml` repeats the production checks on pushes to `main`, uploads only `out/` with the official Pages artifact action, and deploys with the official Pages deploy action. It does not create or update a `gh-pages` branch.

`pages:verify` checks the generated artifact rather than source files alone, including key HTML routes, canonical URLs, sitemap/robots metadata, runtime JSON, the Excel export, a generated Pokémon detail route, the project base path, and the absence of the retired ChatGPT Site host.

## Legacy migration artifacts

`public/_headers`, the Vinext worker, and Sites-oriented helper scripts are retained only so historical migration/research workflows remain reproducible. GitHub Pages does not consume these files, and Pages snapshot validation is intentionally decoupled from `_headers`.

The old `.openai/hosting.json` deployment binding is intentionally removed so the repository does not advertise or accidentally reuse the retired ChatGPT Sites deployment target.
