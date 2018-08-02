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
        'Use class property instead of setting initial state in the constructor',
      category: 'ECMAScript 7',
      recommended: false
    },
    fixable: 'code',
    schema: []
  },

  create: function(context) {
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

    function assigningToState(node) {
      return (
        node.left &&
        node.left.type === 'MemberExpression' &&
        node.left.property &&
        node.left.property.name === 'state'
      )
    }

    function reconstructState(node) {
      const sourceCode = context.getSourceCode()
      return ' state = ' + sourceCode.getText(node.right)
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    function checkAssignment(node) {
      if (assigningToThis(node) && assigningToState(node)) {
        // this seems... maybe brittle
        const constructorNode = node.parent.parent.parent.parent

        context.report({
          node: node,
          message: "Don't set initial state in the constructor",
          fix: fixer => [
            fixer.insertTextAfter(constructorNode, reconstructState(node)),
            fixer.remove(node)
          ]
        })
      }
    }

    const constructorDefinition = [
      'MethodDefinition[kind="constructor"]',
      'ExpressionStatement',
      'AssignmentExpression'
    ].join(' ')

    return {
      [constructorDefinition]: checkAssignment
    }
  }
}
