module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  if (
    options['explicit-require'] === false ||
    ReactUtils.hasReact(root)
  ) {
    return api.jscodeshift(fileInfo.source)
      .findVariableDeclarators('fetchData')
      .renameTo('fetchData1')
      .toSource();
  }

  return null;
}
