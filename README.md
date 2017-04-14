## react-codemod [![Build Status](https://travis-ci.org/reactjs/react-codemod.svg)](https://travis-ci.org/reactjs/react-codemod)

This repository contains a collection of codemod scripts based for use with
[JSCodeshift](https://github.com/facebook/jscodeshift) that help update React
APIs.

### Setup & Run

  * `npm install -g jscodeshift`
  * `git clone https://github.com/reactjs/react-codemod.git` or download a zip file
    from `https://github.com/reactjs/react-codemod/archive/master.zip`
  * Run `npm install` in the react-codemod directory
    * Alternatively, run [`yarn`](https://yarnpkg.com/) to install in the
      react-codemod directory for a reliable dependency resolution
  * `jscodeshift -t <codemod-script> <path>`
  * Use the `-d` option for a dry-run and use `-p` to print the output
    for comparison

### Included Scripts

#### `compose-connect`

Converts `connect` wrapped comments into `compose` (from `redux`).

```sh
jscodeshift -t idagio-codemod/transforms/compose-connect.js <path>
```
