const fs = require('fs');
const path = require('path');

const sheetReader = require('..');

const oldPath = process.argv[2];

const oldData = sheetReader.readFile(oldPath, { excludeMetadata: true });

const oldJsonPath = path.join(path.dirname(oldPath), path.basename(oldPath, path.extname(oldPath)) + '.json');

const oldJson = JSON.stringify(oldData, null, 2);

fs.writeFileSync(oldJsonPath, oldJson);
