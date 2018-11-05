import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
    input: 'esm5/index.js',
    output: {
        format: 'umd',
        name: 'neoskop.hrbac',
        file: 'bundle/hrbac.umd.js',
        sourcemap: true,
        amd: {
            id: '@neoskop/hrbac'
        }
    },
    plugins: [
        resolve(),
        sourcemaps()
    ],
    treeshake: false
}
