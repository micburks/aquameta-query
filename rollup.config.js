import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: 'dist/build.js',
  plugins: [
    babel(),
    resolve({
      jsnext: true,
      main: true,
      extensions: [ '.js' ]
    })
  ]
}
