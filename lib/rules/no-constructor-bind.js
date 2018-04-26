/**
 * @fileoverview Use class arrow methods instead of binding in the constructor
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
        'Use class arrow methods instead of binding in the constructor',
      category: 'ECMAScript 7',
      recommended: false
    },
    fixable: null,
    schema: []
  },

  create: function(context) {
    const selector = [
      'MethodDefinition[kind="constructor"]',
      'ExpressionStatement',
      'AssignmentExpression'
    ].join(' ')

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

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    function checkAssignment(node) {
      if (assigningToThis(node) && callingBind(node) && passingThis(node)) {
        context.report({ node, message: 'Use arrow methods instead of bind.' })
      }
    }

    return {
      [selector]: checkAssignment
    }
  }
}
