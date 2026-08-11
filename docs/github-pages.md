# GitHub Pages static export

The canonical production site for this repository is:

`https://xiangwang2000.github.io/pokemon-go-retention-guide/`

GitHub Pages is the only supported production publishing target. Older Sites/Vinext files remain in the repository only as legacy migration and local research tooling; they are not part of the production artifact or deployment path.

## Default development and build workflow

The default npm commands now follow the GitHub Pages/Next.js path:

```powershell
npm run dev
npm run build
npm run pages:verify
npm start
```

`npm run dev` validates the Pages snapshot and starts Next.js development mode. `npm run build` creates the production static export in `out/`. `npm run pages:verify` validates the generated artifact, and `npm start` serves `out/` locally under the GitHub Pages project base path.

The committed `.env.example` already contains the production project-site values:

```text
NEXT_PUBLIC_BASE_PATH=/pokemon-go-retention-guide
NEXT_PUBLIC_SITE_URL=https://xiangwang2000.github.io/pokemon-go-retention-guide/
```

If you do not copy those values into a local `.env`, the development server can still run at the root path; CI and production set the Pages values explicitly.

The Pages build enables Next.js `output: "export"` and writes only the static artifact to `out/`. Dynamic Pokémon routes are enumerated with `generateStaticParams`; the browser then loads the corresponding audit, detail, and family JSON files when a detail page opens.

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

`.github/workflows/verify-pages-pr.yml` validates pull requests with snapshot checks, committed-snapshot review consistency, lint, typecheck, tests, the default `npm run build`, and `pages:verify` before merge. `review:validate` is database-independent in CI: it compares the committed dashboard/review snapshots with every configured per-batch review report, including family handling summaries, issue counts, scoped holds, and recalibration state.

`.github/workflows/deploy-pages.yml` repeats the same production checks on pushes to `main`, uploads only `out/` with the official Pages artifact action, and deploys with the official Pages deploy action. It does not create or update a `gh-pages` branch. After deployment, the workflow runs HTTP smoke checks against the deployed Pages URL.

`pages:verify` validates the generated artifact rather than source files alone. It checks all generated Pokémon detail routes and canonical URLs, sitemap/robots metadata, runtime JSON counts, the Excel export, the project base path, and the absence of the retired ChatGPT Site host. It then serves `out/` locally and runs HTTP smoke checks for the home/review/sources/changes routes, representative first/middle/last Pokémon detail routes derived from the current audit summary, `home.json`, sitemap, robots, the exact Excel payload, and 404 behavior. The deployed-site smoke uses the same representative route contract, so expanding the Pokédex does not require hard-coded smoke-route updates.

## Legacy migration commands

Legacy Sites/Vinext workflows are intentionally explicit rather than default:

```text
npm run sites:dev
npm run sites:build
npm run sites:start
npm run sites:check
npm run sites:purge
```

`public/_headers`, the Vinext worker, and Sites-oriented helper scripts remain only so historical migration/research workflows stay reproducible. GitHub Pages does not consume these files, and Pages snapshot validation is intentionally decoupled from `_headers`.

The old `.openai/hosting.json` deployment binding is intentionally removed so the repository does not advertise or accidentally reuse the retired ChatGPT Sites deployment target.
