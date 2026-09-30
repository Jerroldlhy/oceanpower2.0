# Reading the plain JavaScript website

You only need HTML, CSS and JavaScript to work on the interface. React and JSX have been removed.

## Which file does what?

| File | Purpose |
| --- | --- |
| `index.html` | The browser entry page. Links the CSS and loads `src/main.js`. |
| `src/main.js` | Starts the application. |
| `src/app.js` | Stores the current page and connects click, input, change and submit events to actions. |
| `src/views/layout.js` | HTML for the sidebar, header, language switcher and settings. |
| `src/views/opportunities.js` | HTML for the dashboard, table, add/edit form and project details. |
| `src/views/sources.js` | HTML for source cards and manual checking/editing forms. |
| `src/views/competitors.js` | HTML for competitor records and editing. |
| `src/views/reports.js` | HTML for report filters and the printable report. |
| `src/ui.js` | Shared HTML functions for inputs, buttons, icons and drawers. |
| `src/styles.css`, `src/manual.css`, `src/vanilla.css` | The site's ordinary CSS styles and responsive layouts. |
| `src/data.js` | Demo records, source identities, product catalog and empty-record defaults. |
| `src/lib/workspace.js` | Search, filters, translations, dates and local browser storage. |
| `src/lib/reports.js` | Report calculations and Excel export. |
| `src/models.js` | Comments describing the data structures, plus status/category lists. |
| `locales/en.json`, `locales/zh-CN.json` | English and Chinese interface text. |

## How HTML is made

The views return strings containing ordinary HTML. Backticks let a JavaScript string span multiple lines. `${...}` inserts a value into that string. This is standard JavaScript, not JSX.

For example:

```js
const label = 'Save';
const html = `<button type="button">${label}</button>`;
```

The app places the HTML in the page using `innerHTML`. Always pass staff-entered values through `escapeHtml` (also called `e`) from `src/ui.js` first. This displays the text without allowing it to become HTML code. Links also go through `safeUrl`, which accepts only HTTP or HTTPS URLs.

## How buttons work

Buttons use data attributes, for example:

```html
<button data-action="navigate" data-value="sources">Tender Sources</button>
```

One click listener in `src/app.js` reads these values and opens the right page. Forms use `data-form`; their fields use ordinary `name` attributes. Input listeners update drafts without replacing the input while someone types. The submit listener validates and saves the record.

## What stays saved?

Records use the same localStorage key as the previous version: `oceanpower-manual-rebar-v2`. Existing records, source checks, employees and bookmarks remain compatible. Use the same browser and local server address to access them. The Settings page can download a backup.

## Commands

```sh
npm start       # Run the local website
npm test        # Check the workflows and Excel output
npm run build   # Make a distributable website in dist/
```

Use the local server rather than double-clicking `index.html`. Vite handles JavaScript modules, JSON translations and the Excel dependency. There is no frontend framework compiler.
