import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import eslint from 'rollup-plugin-eslint'
const pkg = require('./package.json')

export default {
  entry: 'src/index.js',
  format: 'cjs',
  targets: [
    { dest: pkg.main, format: 'cjs' },
    { dest: pkg.module, format: 'es' }
  ],
  external: [
    'fetch',
    'Headers',
    'location'
  ],
  plugins: [
    eslint(),
    resolve({
      jsnext: true,
      main: true,
      extensions: [ '.js' ]
    }),
    babel()
  ]
}
