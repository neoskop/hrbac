import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'index.js',
    output: {
        format: 'amd',
        file: 'dist/hrbac.bundle.js'
    },
    external: [
        '@angular/core',
        '@angular/common'
    ],
    plugins: [
        resolve()
    ],
    treeshake: false,
    exports: 'named',
    amd: {
        id: '@neoskop/hrbac'
    }
}
