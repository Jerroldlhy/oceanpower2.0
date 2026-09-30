import { createApp } from './app.js';

const app = createApp(document.getElementById('root'));

// Clean up listeners before Vite reloads this module during development.
if (import.meta.hot) import.meta.hot.dispose(() => app.destroy());
