export default function ReduxUtils(j) {
  const ReactUtils = require('./ReactUtils')(j);

  const getImport = function (root, moduleName) {
    return root
      .find(j.ImportDeclaration, {
        source: {
          value: moduleName,
        }
      })
      ;
  }

  const hasImport = function (root, moduleName, importName) {
    const moduleImport = getImport(root, moduleName);
    return moduleImport
        .find(j.ImportSpecifier, {
          imported: {
            name: importName,
          }
        })
        .length > 0;
  }

  function getConnectCall(root) {
    return root.find(j.CallExpression, {
      callee: {
        name: 'connect'
      }
    });
  }

  function isConnectedReactClass(root) {
    return ReactUtils.findReactES6ClassDeclaration(root).length &&
      hasImport(root, 'react-redux', 'connect') &&
      getConnectCall(root);
  }

  function getImportDeclaration(moduleName, importName) {
    return j.importDeclaration(
      [j.importSpecifier(j.identifier(importName))],
      j.literal(moduleName)
    );
  }

  function addImportBefore(moduleName, importName, beforeModule) {
    const importDeclaration = getImportDeclaration(moduleName, importName);
    beforeModule.insertBefore(importDeclaration);
  }

  return {
    getConnectCall,
    isConnectedReactClass,
    hasImport,
    getImport,
    addImportBefore,
  }
}
