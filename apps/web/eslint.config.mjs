import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import fsdPlugin from 'eslint-plugin-fsd-lint';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // FSD Plugin recommended preset (includes plugin + rules)
  fsdPlugin.configs.recommended,
  {
    rules: {
      // React Hooks rules (eslint-config-next에서 기본 제공, 여기서 커스터마이징)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
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
