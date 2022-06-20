#!/usr/bin/env node

const fs = require('fs');
const pkg = require(__dirname + '/../package');
const distPkg = require(__dirname + '/../dist/package');

for (const key of ['version', 'description', 'repository', 'author', 'license', 'peerDependencies']) {
    distPkg[key] = pkg[key];
}

const cjsPath = './cjs/index.js';

distPkg.main = cjsPath;
distPkg.exports['.'].node = cjsPath;
distPkg.exports['.'].require = cjsPath;

let fesm2015Adamant = fs.readFileSync(__dirname + '/../dist/fesm2015/neoskop-hrbac.mjs', 'utf8');

fesm2015Adamant = fesm2015Adamant.replace(/import {(.+)} from 'tslib';/, "import * as __tslib from 'tslib';\nconst {$1} = __tslib;");
fesm2015Adamant = fesm2015Adamant.replace(/import {(.+)} from 'rxjs';/, "import * as __rxjs from 'rxjs';\nconst {$1} = __rxjs;");

fs.writeFileSync(__dirname + '/../dist/fesm2015/neoskop-hrbac.mjs', fesm2015Adamant);
fs.writeFileSync(__dirname + '/../dist/cjs/package.json', JSON.stringify({ module: 'commonjs' }, null, 2));
fs.writeFileSync(__dirname + '/../dist/package.json', JSON.stringify(distPkg, null, 2));
fs.writeFileSync(__dirname + '/../dist/README.md', fs.readFileSync(__dirname + '/../README.md'));
fs.writeFileSync(__dirname + '/../dist/neoskop.png', fs.readFileSync(__dirname + '/../neoskop.png'));
