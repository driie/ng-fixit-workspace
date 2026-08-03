/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,cjs,mjs,ts,cts,mts}': files => {
    const paths = files.map(file => `"${file}"`).join(' ');
    return [`oxlint --fix ${paths}`, `oxfmt --write --no-error-on-unmatched-pattern ${paths}`];
  },
  '*.{html,json,jsonc,md,yml,yaml,css,scss,less,toml}': files => {
    const paths = files.map(file => `"${file}"`).join(' ');
    return `oxfmt --write --no-error-on-unmatched-pattern ${paths}`;
  },
};
