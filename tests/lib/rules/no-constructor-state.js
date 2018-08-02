/**
 * @fileoverview Use class arrow methods instead of binding in the constructor
 * @author Mark Battersby
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-constructor-state'),
  RuleTester = require('eslint').RuleTester

RuleTester.setDefaultConfig({ parser: 'babel-eslint' })

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var error = {
  type: 'AssignmentExpression',
  message: "Don't set initial state in the constructor"
}

var ruleTester = new RuleTester()
ruleTester.run('no-constructor-state', rule, {
  valid: [
    'class myClass { state = { foo: "bar" } }',
    'class myClass { constructor() { this.notState = { foo: "bar" } } }',
    'class myClass { constructor() { this.notState = { foo: "bar" } } state = { foo: "bar" } }'
  ],

  invalid: [
    {
      code:
        'class myClass { constructor() { this.state = { foo: "bar" } } }',
      output:
        'class myClass { constructor() {  } }',
      errors: [error]
    },
    {
      // Should handle multiple classes.
      code:
        `class firstClass { constructor() { this.state = { foo: "bar" } } }
         class secondClass { constructor() { this.state = { foo: "bar" } } }`,
      output:
        `class firstClass { constructor() {  } }
         class secondClass { constructor() {  } }`,
      errors: [error, error]
    }
  ]
})
