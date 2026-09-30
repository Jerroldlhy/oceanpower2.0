# Oceanpower China Market Intelligence

A China-first bilingual React + TypeScript prototype. All projects, metrics, competitor updates and analysis are mock data. No scraping or external AI calls are performed.

## Run

```sh
npm install
npm run dev
```

On PowerShell systems that restrict script execution, use `npm.cmd` instead of `npm`.

```sh
npm run build
npm run preview
```

Run interaction checks with `npm test`. The tests cover locale parity, bilingual and material-alias search, filtering, saved projects, human review, and bilingual report generation.

## Prototype features

- Chinese and English interface using `/locales/zh-CN.json` and `/locales/en.json`.
- Search both languages, including FRP material aliases, with province, application, relevance and discovery-date filters.
- Detailed project tabs, product recommendations, information gaps and explicit human review.
- Locally persisted bookmarks, review acknowledgments, competitor watchlists and language preference.
- Chinese, English and bilingual reports. PDF via browser print, real `.xlsx` export, and downloadable `.eml` email drafts. Emails are not sent.
- Recharts dashboards, Tailwind CSS, and a shadcn-style Radix Slot / CVA button primitive.

## Scope and architecture

Only China is enabled. `src/data.ts` separates the market registry, localized project records, product catalog, material aliases and aggregate chart data. Add countries only in subsequent phases, with separate source adapters and localized records. The UI has no global or Asia opportunity feed.

The dashboard shows an illustrative 128-project market snapshot. Eight representative mock projects are available in the detailed register. Filters act on these eight records, not on the illustrative aggregate metrics. Dates are relative to the fixed September 30, 2026 demo snapshot. Product matching and summaries are deterministic mock analysis, not validated engineering advice. Report generation produces a full China briefing from the mock register, independent of table filters.

Future production work: approved source integrations, real AI extraction with citations, server persistence, authentication and permissions, document ingestion, and engineering/commercial approval workflows.
