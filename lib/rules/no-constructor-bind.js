/**
 * @fileoverview Use class arrow functions instead of binding in the constructor
 * @author Mark Battersby
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description:
        'Use class arrow functions instead of binding in the constructor',
      category: 'ECMAScript 7',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },

  create: function(context) {
    let thisClass = {}

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function assigningToThis(node) {
      return (
        node.left &&
        node.left.type === 'MemberExpression' &&
        node.left.object &&
        node.left.object.type === 'ThisExpression'
      )
    }

    function callingBind(node) {
      return (
        node.right &&
        node.right.type === 'CallExpression' &&
        node.right.callee &&
        node.right.callee.property &&
        node.right.callee.property.name === 'bind'
      )
    }

    function passingThis(node) {
      return (
        node.right &&
        node.right.arguments &&
        node.right.arguments.length === 1 &&
        node.right.arguments[0].type === 'ThisExpression'
      )
    }

    function methodNameFromCall(node) {
      return node.right.callee.object.property.name
    }

    function findMethodDef(name) {
      return thisClass.classMethods[name]
    }

    function getParamsText(params) {
      if (params.length) {
        const sourceCode = context.getSourceCode()

        const openParen = sourceCode.getTokenBefore(params[0])
        const closeParen = sourceCode.getTokenAfter(params[params.length - 1])

        return sourceCode.text.slice(openParen.start, closeParen.end)
      } else {
        return '()'
      }
    }

    function convertToArrowFunction(node) {
      const { params, body } = node.value
      const sourceCode = context.getSourceCode()

      const paramsText = getParamsText(params)

      const bodyText =
        body.type === 'BlockStatement' ? sourceCode.getText(body) : null

      const name = node.key.name
      const isAsync = node.value.async

      return `${name} = ${isAsync ? 'async ' : ''}${paramsText} => ${bodyText}`
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    function checkAssignment(node) {
      if (assigningToThis(node) && callingBind(node) && passingThis(node)) {
        logBoundMethod(node)
      }
    }

    function logBoundMethod(node) {
      thisClass.boundMethods.push(node)
    }

    function logMethodDefinition(node) {
      thisClass.classMethods[node.key.name] = node
    }

    function init() {
      thisClass.boundMethods = []
      thisClass.classMethods = {}
    }

    function report() {
      thisClass.boundMethods.forEach(node => {
        context.report({
          node: node,
          message: 'use arrow functions instead of binding in the constructor',
          fix: fixer => {
            const definition = findMethodDef(methodNameFromCall(node))
            if (!definition) return

            return [
              fixer.remove(node.parent),
              fixer.replaceText(definition, convertToArrowFunction(definition))
            ]
          }
        })
      })

      thisClass = {}
    }

    const constructorDefinition = [
      'MethodDefinition[kind="constructor"]',
      'ExpressionStatement',
      'AssignmentExpression'
    ].join(' ')

    return {
      [constructorDefinition]: checkAssignment,
      MethodDefinition: logMethodDefinition,
      'ClassDeclaration': init,
      'ClassDeclaration:exit': report,
      'ClassExpression': init,
      'ClassExpression:exit': report
    }
  }
}
