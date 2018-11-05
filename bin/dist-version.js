#!/usr/bin/env node

const fs = require('fs');
const pkg = require(__dirname + '/../package');
const distPkg = require(__dirname + '/../dist/package');

distPkg.version = pkg.version;

fs.writeFileSync(__dirname + '/../dist/package.json', JSON.stringify(distPkg, null, 2));
