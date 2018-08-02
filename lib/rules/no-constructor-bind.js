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

    function getParamsFromLines(params, lines) {
      if (params.length) {
        const start = params[0].loc.start
        const end = params[params.length - 1].loc.end

        return getTextFromRange(lines, start, end)
      } else {
        return '()'
      }
    }

    function convertToArrowFunction(node) {
      const { params, body } = node.value
      const sourceCode = context.getSourceCode()
      const paramsText = getParamsFromLines(params, sourceCode.getLines())
      const bodyText =
        body.type === 'BlockStatement' ? sourceCode.getText(body) : null

      return `${node.key.name} = ${paramsText} => ${bodyText}`
    }

    function getTextFromRange(lines, locStart, locEnd) {
      const _lines = lines.slice(locStart.line - 1, locEnd.line)
      const params = _lines
        .map((s, i) => {
          if (i === 0) {
            return s.slice(
              locStart.column - 1,
              locStart.line === locEnd.line ? locEnd.column + 1 : undefined
            )
          }
          if (i === _lines.length - 1) {
            return s.slice(0, locEnd.column + 1)
          }
          return s
        })
        .join('\n')
      return params.charAt(0) === '(' ? params : `(${params.trim()})`
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
              fixer.replaceText(node, ''),
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
      'ClassDeclaration:exit': report
    }
  }
}
