module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json'
    },
    rules: {
      // Your custom rules
    },
    env: {
      node: true,
      es6: true
    },
    ignorePatterns: ['dist/', 'node_modules/']
  }