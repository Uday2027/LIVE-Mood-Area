import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        NodeJS: 'readonly',
      },
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      'no-console':                          'warn',
      'prefer-const':                        'error',
      'eqeqeq':                              'error',
      'no-unused-vars':                      'off',
      '@typescript-eslint/no-unused-vars':   ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any':  'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
];
