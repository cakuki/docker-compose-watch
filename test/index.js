const assert = require('assert')
const execa = require('execa')
const path = require('path')

const dcw = require('../src')

process.chdir(path.join(__dirname, './fixture'))
