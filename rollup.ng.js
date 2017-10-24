import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import * as path from 'path';

const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@neoskop/hrbac': 'neoskop.hrbac',
    'rxjs/BehaviorSubject': 'Rx'
};

export default {
    input: 'lib/ng/index.js',
    output: {
        format: 'umd',
        name: 'neoskop.hrbac.ng',
        file: 'dist/hrbac-ng.bundle.js',
        sourcemap: true
    },
    external: Object.keys(globals),
    globals,
    plugins: [
        {
            resolveId(name) {
                if('..' === name) {
                    return '@neoskop/hrbac';
                }
            }
        },
        resolve(),
        sourcemaps()
    ],
    treeshake: false,
    amd: {
        id: '@neoskop/hrbac/ng'
    }
}
