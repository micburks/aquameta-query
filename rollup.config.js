import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import eslint from 'rollup-plugin-eslint'
import uglify from 'rollup-plugin-uglify'

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
    uglify(),
    eslint(),
    babel(),
    resolve({
      jsnext: true,
      main: true,
      extensions: [ '.js' ]
    })
  ]
}
