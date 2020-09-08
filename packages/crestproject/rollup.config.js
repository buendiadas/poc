import sourcemaps from 'rollup-plugin-sourcemaps';
import node from 'rollup-plugin-node-resolve';

export default [
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'crestproject',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [node(), sourcemaps()],
    onwarn,
  },
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [node(), sourcemaps()],
    onwarn,
  },
];

export function onwarn(message) {
  const suppressed = ['UNRESOLVED_IMPORT', 'THIS_IS_UNDEFINED'];

  if (!suppressed.find((code) => message.code === code)) {
    return console.warn(message.message);
  }
}
