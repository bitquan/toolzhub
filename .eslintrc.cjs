/*
 * Minimal ESLint config for React + TypeScript + Vite
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Allow "any" in a few places in this project
    '@typescript-eslint/no-explicit-any': 'off',
    // Friendlier unused var rule (allow leading underscore to ignore)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // Helpful in React + Vite to avoid HMR issues
    'react-refresh/only-export-components': 'warn',
    // Keep console in dev, warn in prod
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'functions/lib/',
    'functions/node_modules/',
  ],
};
