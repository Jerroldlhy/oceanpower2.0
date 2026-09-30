# Oceanpower China Rebar Tender Tracking

Phase 1: **China first · Rebar only · Manual first**. This is an in-place update of the existing bilingual Oceanpower prototype, preserving the dashboard title “China market overview” and its visual design.

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
npm run preview
```

## Features

- Chinese / English navigation, forms, tables, statuses, notifications and reports.
- Add/edit rebar tenders; manually assign priority, owner, status and potential products.
- Search Chinese, English and mixed rebar keywords; filter by province, product type, status, owner, source and priority.
- Nine identified tender/data sources, with manual check logs, timestamps, staff attribution and optional discovery counts.
- Manual competitor records, related opportunities, document links, notes and activity timelines.
- Reports calculated from stored data with date-added and business filters; PDF via browser print and real Excel export.
- Local browser persistence and JSON backup. Demo records are explicitly labeled; no live-data claim.

No AI, scraping, automated discovery, competitor monitoring or email sending is implemented. Product scope is limited to GFRP, BFRP, CFRP and FRP/composite rebar. Final product suitability requires engineering review.

See [Phase 1 workflow, architecture and source provenance](docs/manual-phase-1.md) for model definitions, storage behavior, verified platform links and future extension points.
