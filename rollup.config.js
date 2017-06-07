import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import eslint from 'rollup-plugin-eslint'

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: 'dist/build.js',
  external: [
    'fetch',
    'Headers',
    'location'
  ],
  plugins: [
    eslint(),
    babel(),
    resolve({
      jsnext: true,
      main: true,
      extensions: [ '.js' ]
    })
  ]
}
