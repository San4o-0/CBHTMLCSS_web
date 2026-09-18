import js from '@eslint/js';
import globals from 'globals';

export default [
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
];
