require('./utils/array-polyfills');
import ru from './utils/ReactUtils';
import ru2 from './utils/ReduxUtils';

function getFetchData(j, root) {
  return root.find(j.MethodDefinition, {
    key: {
      name: 'fetchData'
    },
    static: true,
  });
}

export default function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const ReactUtils = ru(j);
  const ReduxUtils = ru2(j);

 if (ReduxUtils.isConnectedReactClass(root)) {
   let classDef = root.find(j.ClassDeclaration);
   const exportedDeclaration = root.
     find(j.ExportNamedDeclaration, {
       declaration: j.ClassDeclaration
     });

   if (exportedDeclaration.length) {
     classDef = exportedDeclaration;
   }

   if (!ReduxUtils.hasImport(root, 'redux', 'compose')) {
     const reduxImport = ReduxUtils.getImport(root, 'react-redux');
     ReduxUtils.addImportBefore('redux', 'compose', reduxImport);
   }

   ReduxUtils.getConnectCall(root)
     .replaceWith(nodePath => {
       const args = [];
       if (getFetchData(j, root).length > 0) {
         getFetchData(j, root)
           .replaceWith(nodePath => {

             const newFn = j.functionDeclaration(
               j.identifier('fetchData'),
               nodePath.node.value.params,
               nodePath.node.value.body
             );

             classDef.insertAfter(newFn);
             return null;
           });

         const dataComponentBehaviour = j.callExpression(
           j.identifier('dataComponent'),
           [j.identifier('fetchData')]
         );

         args.push(dataComponentBehaviour);

         const hocImport = j.importDeclaration(
           [j.importDefaultSpecifier(j.identifier('dataComponent'))],
           j.literal('../lib/hoc/dataComponent')
         );
         const composeImport = ReduxUtils.getImport(root, 'react-redux');
         composeImport.insertAfter(hocImport);
       }

       // chrome
       classDef
         .find(j.ClassProperty, {
           key: {
             name: 'chrome'
           },
           static: true,
         })
         .replaceWith(nodePath => {
           const chromeDeclaration = j.variableDeclaration('const', [j.variableDeclarator(j.identifier('chrome'), nodePath.node.value)]);
           const chromeComponent = j.callExpression(
             j.identifier('chromeComponent'),
             [j.identifier('chrome')]
           );

           classDef.insertAfter(chromeDeclaration);

           args.push(chromeComponent);

           const chromeHocImport = j.importDeclaration(
             [j.importDefaultSpecifier(j.identifier('chromeComponent'))],
             j.literal('../lib/hoc/chromeComponent')
           );
           const composeImport = ReduxUtils.getImport(root, 'react-redux');
           composeImport.insertAfter(chromeHocImport);

           return null;
         });

       args.push(nodePath.node);

       if (ReduxUtils.hasImport(root, 'react-intl', 'injectIntl')) {
         root.find(j.CallExpression, {
          callee: {
            name: 'injectIntl',
          }
         }).replaceWith(nodePath => {
           args.push(j.identifier('injectIntl'));
           return nodePath.node.arguments[0];
         });
       }

       return j.callExpression(
         j.identifier('compose'),
         args
       );
     });
  }

  return root.toSource({ quote: 'single', trailingComma: true });
}
