module.exports = {
  root: true,
  env: {
    'es6': true,
    'node': true,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'require-jsdoc': 0,
    'max-len': ['error', 180],
    'new-cap': ['error', {'capIsNew': false}],
  },
  parserOptions: {
    'ecmaVersion': 8,
  },
  globals: {
    'document': 'readonly',
  },
};
