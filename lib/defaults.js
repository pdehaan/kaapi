module.exports = {
  'timeout': 2000,
  'base': '',
  'grep': null,
  'directory': 'specs',
  'pattern': '**/*.spec.js',
  'ui': 'bdd',
  'reporter': 'dot',
  'require': {
    'base': 'public',
    'paths': {}
  },
  'mocks': {},
  'server': {
    'port': 9876
  }
};