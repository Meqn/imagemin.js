const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const json = require('@rollup/plugin-json')
const commonjs = require('rollup-plugin-commonjs')
const pkg = require('./package.json')

module.exports = {
  input: 'src/main.js',
  plugins: [
    resolve(),
    babel(),
    commonjs(),
    json()
  ],
  output: {
    file: `dist/index.js`,
    format: 'umd',
    name: 'Compressor',
    sourcemap: true
  }
}
