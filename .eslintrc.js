module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/airbnb'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': [0, 'error', 'windows'],
    "indent": ["off", 2],
    "max-len" : ["error", {code : 300}],
    "no-irregular-whitespace": 0,
    "Trailing spaces not allowed": 0,
    "no-trailing-spaces": 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
