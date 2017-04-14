function addPropTypesImport(j, root) {
  const importStatement = j.importDeclaration(
    [j.importSpecifier(j.identifier('compose'))],
    j.literal('redux')
  );

  const path = findReactRedux(j, root);

  j(path).insertBefore(importStatement);
}

function findReactRedux(j, root) {
  let target, targetName;

  root
    .find(j.ImportDeclaration)
    .forEach(path => {
      const name = path.value.source.value.toLowerCase();
      if (name === 'react-redux') {
        targetName = name;
        target = path;
      }
    });

  return target;
}

export default function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let hasModifications = false;

  require('./utils/array-polyfills');
  const ReactUtils = require('./utils/ReactUtils')(j);

  if (ReactUtils.hasReact(root)) {
    if (ReactUtils.hasModule(root, 'react-redux') && !ReactUtils.hasModule(root, 'redux') && ReactUtils.findReactES6ClassDeclaration(root)) {
      addPropTypesImport(j, root);
    }

    const classDef = ReactUtils.findReactES6ClassDeclaration(root);
    const ret = classDef.find(j.MethodDefinition)
      .filter(node =>
        (node.value.static === true && node.value.key.name === 'fetchData')
      );


    //ret.replaceWith();
    j(ret).insertAfter(classDef);
  }

  return root.toSource({ quote: 'single' });
}
