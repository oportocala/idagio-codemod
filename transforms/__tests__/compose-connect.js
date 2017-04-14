const tests = [
  'add-compose',
  'move-fetchData',
];

const defineTest = require('jscodeshift/dist/testUtils').defineTest;

describe('compose-connect', () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      'compose-connect',
      null,
      `compose-connect/${ test }`
    )
  );
});