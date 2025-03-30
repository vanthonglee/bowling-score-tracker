import path from 'path';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });
console.log('publicVars', publicVars)
console.log('process.env', process.env.NODE_ENV)
export default defineConfig({
  source: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    define: publicVars
  },
  plugins: [pluginReact()],
});
