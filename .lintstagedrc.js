module.exports = {
  // Type check TypeScript files
  'web/**/*.(ts|tsx)': () => 'cd web && tsc --noEmit --incremental',
  'api/**/*.(ts)': () => 'cd api && tsc --noEmit --incremental',

  // Lint & Prettify TS and JS files
  'web/**/*.(ts|tsx|js)': filenames => [
    `cd web && npm run lint ${filenames.join(' ')}`,
    `cd web && prettier --write ${filenames.join(' ')}`,
  ],
  'api/**/*.(ts|js)': filenames => [
    `cd api && eslint ${filenames.join(' ')}`,
    `cd api && prettier --write ${filenames.join(' ')}`,
  ],

  // Prettify only Markdown and JSON files
  'web/**/*.(md|json)': filenames => `cd web && prettier --write ${filenames.join(' ')}`,
  'api/**/*.(md|json)': filenames => `cd api && prettier --write ${filenames.join(' ')}`,

};
