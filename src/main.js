import '@fontsource-variable/manrope';
import { createApp } from './app.js';

const app = createApp(document.getElementById('root'));
app.syncLive();

// Clean up listeners before Vite reloads this module during development.
if (import.meta.hot) import.meta.hot.dispose(() => app.destroy());
