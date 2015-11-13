module.exports = function () {
  return {
    // debug: true,
    testFramework: 'mocha@2.1.0',
    files: [
      '*.js',
      'test/**/*.js',
      'test/data/**/*.ods',
      {pattern: 'test/**/*.test.js', ignore: true}
    ],
    tests: [
      'test/**/*.test.js'
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    workers: {
      recycle: true
    },
    bootstrap: function (wallaby) {
      require('./test/mocha_setup');
    }
  };
};
