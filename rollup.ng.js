import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import * as path from 'path';

const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@neoskop/hrbac': 'neoskop.hrbac',
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/add/operator/skip': 'Rx'
};

export default {
    input: 'esm5/ng/index.js',
    output: {
        format: 'umd',
        name: 'neoskop.hrbac.ng',
        file: 'bundle/hrbac-ng.umd.js',
        sourcemap: true,
        globals,
        amd: {
            id: '@neoskop/hrbac/ng'
        }
    },
    external: Object.keys(globals),
    plugins: [/*
        {
            resolveId(name) {
                if('..' === name) {
                    return '@neoskop/hrbac';
                }
            }
        },*/
        resolve(),
        sourcemaps()
    ],
    treeshake: false
}
