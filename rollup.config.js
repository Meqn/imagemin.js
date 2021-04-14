const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const json = require('@rollup/plugin-json')
const commonjs = require('rollup-plugin-commonjs')
const { uglify } = require('rollup-plugin-uglify')
const replace = require('rollup-plugin-replace')
const { name, version, author, license } = require('./package.json')

const isProd = process.env.NODE_ENV === 'production' ? true : false
const filename = 'index' + (isProd ? '.min' : '')

const banner = `/*!
 * ${name} v${version}
 * (c) ${(new Date).getFullYear()} ${author}
 * Released under the ${license} License.
 */`

module.exports = {
  input: 'src/main.js',
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
    json(),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (isProd && uglify({
      output: {
        preamble: banner
      }
    }))
  ],
  output: {
    strict: true,
    file: `dist/${filename}.js`,
    format: 'umd',
    name: 'Imagemin',
    sourcemap: !isProd,
    banner
  }
}
