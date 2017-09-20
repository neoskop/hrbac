import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'index.js',
    output: {
        format: 'amd',
        file: 'dist/hrbac.bundle.js'
    },
    name: '@neoskop/hrbac',
    external: [
        '@angular/core',
        '@angular/common'
    ],
    plugins: [
        resolve()
    ]
}
