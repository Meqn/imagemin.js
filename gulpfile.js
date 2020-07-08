const {task, watch, parallel, series} = require('gulp')
const rollup = require('rollup')
const rollupConfig = require('./rollup.config')

const browserSync = require('browser-sync').create()
const reload = browserSync.reload

task('build:lib', async done => {
  const bundle = await rollup.rollup(rollupConfig)
  await bundle.write(Object.assign({}, rollupConfig.output, {
    file: `example/script/index.js`,
  }))
  done()
})
task('static', done => {
  console.log('static')
  done()
})

task('watch', done => {
  watch(`src/**/*.{js,mjs}`, parallel('build:lib')).on('change', reload)
  watch(`example/**`, parallel('static')).on('change', reload)
  done()
})

task('server', done => {
  browserSync.init({
    port: 4000,
    server: {
      baseDir: './example',
      index: 'index.html'
    },
    open: 'external' //打开本地主机URL
  }, done)
})

exports.default = series('build:lib', parallel('server', 'watch'))
