# Oceanpower China Rebar Tender Tracking

Phase 1: **China first · Rebar only · Official feed plus manual research**. The app checks recent public notices from the China Government Procurement Network through a cached server-side adapter and keeps manual workflows for the other configured platforms.

The app is written in **plain HTML, CSS and JavaScript**. There is no React, JSX or TypeScript. Vite runs the local development server and packages the website; ExcelJS handles Excel downloads. The chart and icons use native HTML/CSS/SVG.

Start with `index.html`, `src/main.js`, and `src/app.js`. The HTML for each screen lives in ordinary JavaScript template strings under `src/views/`. Styles remain in `src/styles.css` and `src/manual.css`, with small native-chart additions in `src/vanilla.css`. See [the code guide](docs/code-guide.md) for an explanation of how these files fit together.

## Run

```sh
npm install
npm start
```

`npm run dev` also starts Vite. On PowerShell systems with script restrictions, use `npm.cmd`.

```sh
npm test
npm run build
npm run serve
npm run preview
```

## Features

- Chinese / English navigation, forms, tables, statuses, notifications and reports.
- Add/edit rebar tenders; manually assign priority, owner, status and potential products.
- Search Chinese, English and mixed rebar keywords; filter by province, product type, status, owner, source and priority.
- One connected official source plus nine manually checked tender/data sources.
- Manual competitor records, related opportunities, document links, notes and activity timelines.
- Reports calculated from stored data with date-added and business filters; PDF via browser print and real Excel export.
- Local browser persistence and JSON backup. New workspaces start empty and populate from official or manually entered records.

No AI, competitor monitoring or email sending is implemented. The official collector performs low-frequency public-search requests, caches them for 15 minutes and stops cleanly when the source rate-limits access. Product scope is limited to GFRP, BFRP, CFRP and FRP/composite rebar. Final product suitability requires engineering review.

## Live-data configuration

Development (`npm start`) and production (`npm run build && npm run serve`) both expose `/api/live-opportunities`. Optional environment variables are `CCGP_LOOKBACK_DAYS` (default 30, maximum 180), `CCGP_CACHE_MS` (default 900000), `CCGP_MAX_RESULTS` (default 100), and comma-separated `CCGP_KEYWORDS`. Keep polling conservative and obtain formal API/data-sharing access before high-volume production use.

See [Phase 1 workflow, architecture and source provenance](docs/manual-phase-1.md) for model definitions, storage behavior, verified platform links and future extension points.
