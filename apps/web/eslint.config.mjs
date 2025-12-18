import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import fsdPlugin from 'eslint-plugin-fsd-lint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      'fsd-lint': fsdPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // React Hooks rules (with React Compiler)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // FSD Architecture rules
      'fsd-lint/forbidden-imports': [
        'error',
        {
          layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
      'fsd-lint/layer-imports': [
        'error',
        {
          layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
      'fsd-lint/public-api': [
        'error',
        {
          layers: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'ios/**',
    'android/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
