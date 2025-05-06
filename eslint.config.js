// eslint.config.js
// Note: This file uses CommonJS format

const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Include TypeScript recommended rules
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Add any other custom rules here
    },
  },
  {
    // Global ignores
    ignores: ['dist/**', 'node_modules/**', 'build/**']
  }
];