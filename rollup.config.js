import babel from 'rollup-plugin-babel'
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
    'isomorphic-fetch'
  ],
  plugins: [
    eslint(),
    babel()
  ]
}
