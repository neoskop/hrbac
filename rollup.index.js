import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'index.js',
    output: {
        format: 'umd',
        name: 'neoskop.hrbac',
        file: 'dist/hrbac.bundle.js',
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
