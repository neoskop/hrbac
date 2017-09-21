import resolve from 'rollup-plugin-node-resolve';

export default {
    input: 'ng.js',
    output: {
        format: 'amd',
        file: 'dist/hrbac-ng.bundle.js'
    },
    external: id => {
        return id.startsWith('@angular') || id.startsWith('rxjs') || id.startsWith('@neoskop');
    },
    plugins: [
        {
            resolveId(name) {
                if(name.startsWith('..')) {
                    return '@neoskop/hrbac';
                }
            }
        },
        resolve(),
    ],
    treeshake: false,
    exports: 'named',
    amd: {
        id: '@neoskop/hrbac/ng'
    }
}
