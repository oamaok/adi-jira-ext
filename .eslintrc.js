module.exports = {
  'extends': 'airbnb-base',
  'env': {
    browser: true,
    webextensions: true
  },
  'rules': {
    'semi': ['error', 'never'],
    'max-len': ['error', { 'code': 80 }]
  }
};