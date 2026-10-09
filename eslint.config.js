import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // Файли starter-ів ЛР-8/9, які за умовами не змінюються, — не наш код
    ignores: ['Lab8/test/**', 'Lab8/main.js', 'Lab9/check/**', 'Lab9/src/state.js'],
  },
  js.configs.recommended,
  {
    files: ['Lab*/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'script',
      globals: globals.browser,
    },
    rules: {
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'error',
    },
  },
  {
    // ЛР-8 і ЛР-9 — ES-модулі (import/export)
    files: ['Lab8/**/*.js', 'Lab9/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
