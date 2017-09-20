import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'ng.js',
    output: {
        format: 'amd',
        file: 'dist/hrbac-ng.bundle.js'
    },
    name: '@neoskop/hrbac/ng',
    external: id => {
        return id.startsWith('@angular') || id.startsWith('rxjs');
    },
    plugins: [
        resolve()
    ]
}
