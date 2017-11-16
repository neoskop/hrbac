import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'esm5/index.js',
    output: {
        format: 'umd',
        name: 'neoskop.hrbac',
        file: 'bundle/hrbac.umd.js',
        sourcemap: true
    },
    plugins: [
        resolve(),
        sourcemaps()
    ],
    treeshake: false,
    amd: {
        id: '@neoskop/hrbac'
    }
}
