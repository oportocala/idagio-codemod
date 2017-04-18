const tests = [
  'no-react',
  'not-connected',
  'connected',
  'upgrade',
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
