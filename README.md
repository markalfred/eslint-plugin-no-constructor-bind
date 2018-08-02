# eslint-plugin-no-constructor-bind

prefer class arrows to constructor binds

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-no-constructor-bind`:

```
$ npm install eslint-plugin-no-constructor-bind --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-no-constructor-bind` globally.

## Usage

Add `no-constructor-bind` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["no-constructor-bind"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "no-constructor-bind/no-constructor-bind": 2
  }
}
```

## Supported Rules

* no-constructor-bind (:wrench:)
