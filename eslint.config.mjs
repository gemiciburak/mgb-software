import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ESLint flat config.
 *
 * eslint-config-next 16 doğal flat config veriyor (Linter.Config[]), bu yüzden
 * @eslint/eslintrc üzerinden FlatCompat köprüsüne gerek yok — o köprü zaten
 * eslint-plugin-react'ın dairesel yapısıyla çakışıyordu.
 */
const config = [
  {
    ignores: [
      '.next/**',
      '.open-next/**',
      '.wrangler/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/**',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    rules: {
      // Kullanılmayan değişkenler hata; `_` ön ekiyle bilinçli yok sayılanlar serbest.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Tip-only import'lar ayrı yazılır — tsconfig'deki verbatimModuleSyntax ile uyumlu.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
];

export default config;
