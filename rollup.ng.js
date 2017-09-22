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
    input: 'ng.js',
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
            resolveId(name, imp) {
                if(imp) {
                    const p = path.resolve(path.dirname(imp), name);
                    const dir = path.dirname(p);
                    const dirName = path.basename(dir);

                    if(dirName === 'lib') {
                        return '@neoskop/hrbac';
                    }
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
