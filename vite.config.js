import { defineConfig } from 'vite';
import { liveDataPlugin } from './server/api.js';
export default defineConfig({ plugins:[liveDataPlugin()] });
