const babelParser = require('@babel/parser')
const get = require('lodash.get')

const ignoreFiles = ['./src/registerServiceWorker.ts']

module.exports = function ({ types: t }) {
  const header = 'if (typeof recapTracer !== "function") { var recapTracer = require("@recap.dev/client"); }';
  const replaceFunction = (fileName, functionName) => `${functionName} = recapTracer.wrapFunction('${fileName}', '${functionName}', ${functionName})`

  return {
    visitor: {
      Program(node) {
        let fileName = get(this, 'file.opts.filename', 'unknown file')

        node.get('body')[0].insertBefore(babelParser.parse(header).program.body[0]);
        node.traverse({
          'ArrowFunctionExpression'(path) {
            if (path.parent.type === 'CallExpression' && get(path, 'parent.callee.object.name') === 'recapTracer') {
              return
            }
            let functionName = null

            if (path.parent.type === 'VariableDeclarator') {
              functionName = path.parent.id.name
            }

            if (path.parent.type === 'AssignmentExpression') {
              const left = path.parent.left

              if (left.type === 'MemberExpression') {
                functionName = `${left.object.name}.${left.property.name}`
              }
            }

            if (!functionName) {
              return
            }

            path.replaceWith(t.callExpression(
              t.memberExpression(
                t.identifier('recapTracer'),
                t.identifier('wrapFunction')
              ), [
                t.stringLiteral(fileName),
                t.stringLiteral(functionName),
                path.node,
              ])
            )
          },
          'ClassDeclaration'(path) {
            let className = get(path, 'node.id.name', 'unnamed class')

            path.insertAfter(t.callExpression(
              t.memberExpression(
                t.identifier('recapTracer'),
                t.identifier('wrapClass')
              ), [
                t.stringLiteral(fileName),
                t.stringLiteral(className),
                t.identifier(className),
              ])
            )
          },
          'FunctionDeclaration'(path) {
            let functionName = get(path, 'node.id.name', null)

            if (!functionName) {
              return
            }

            path.insertAfter(babelParser.parse(replaceFunction(fileName, functionName)).program.body[0])
          },
        })
      },
    }
  };
};
