/**
 * @fileoverview Use class arrow methods instead of binding in the constructor
 * @author Mark Battersby
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-constructor-bind'),
  RuleTester = require('eslint').RuleTester

RuleTester.setDefaultConfig({ parser: 'babel-eslint' })

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var error = {
  type: 'AssignmentExpression',
  message: 'Use arrow methods instead of bind.'
}

var ruleTester = new RuleTester()
ruleTester.run('no-constructor-bind', rule, {
  valid: [
    'class myClass {myFunction = () => {} }',
    'class myClass {constructor() {this.myFunction = this.myFunction.bind({ foo: "bar" }) } }'
  ],

  invalid: [
    {
      code:
        'class myClass { constructor() { this.myFunction = this.myFunction.bind(this) } }',
      errors: [error]
    }
  ]
})
