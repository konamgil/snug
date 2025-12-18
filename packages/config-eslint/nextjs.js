import baseConfig from './base.js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import fsdPlugin from 'eslint-plugin-fsd-lint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'fsd-lint': fsdPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',

      // React Hooks rules (with React Compiler)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // FSD Architecture rules
      'fsd-lint/forbidden-imports': [
        'error',
        {
          layers: ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
      'fsd-lint/layer-imports': [
        'error',
        {
          layers: ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
      'fsd-lint/public-api': [
        'error',
        {
          layers: ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
    },
  },
];
