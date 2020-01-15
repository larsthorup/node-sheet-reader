const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const sheetReader = require('..');

const oldPath = process.argv[2];
const newPath = process.argv[3];
let externalDiffCommandTemplate = process.argv[4];
if (externalDiffCommandTemplate.startsWith('"') && externalDiffCommandTemplate.endsWith('"')) {
  externalDiffCommandTemplate = externalDiffCommandTemplate.substr(1, externalDiffCommandTemplate.length - 2);
}

const oldData = sheetReader.readFile(oldPath, { excludeMetadata: true });
const newData = sheetReader.readFile(newPath, { excludeMetadata: true });

const oldJsonPath = path.join(path.dirname(oldPath), path.basename(oldPath, path.extname(oldPath)) + '.json');
const newJsonPath = path.join(path.dirname(newPath), path.basename(newPath, path.extname(newPath)) + '.json');

const oldJson = JSON.stringify(oldData, null, 2);
const newJson = JSON.stringify(newData, null, 2);

fs.writeFileSync(oldJsonPath, oldJson);
fs.writeFileSync(newJsonPath, newJson);

const externalDiffCommand = externalDiffCommandTemplate.replace(/\$\{left\}/g, `${oldJsonPath}`).replace(/\$\{right\}/, `${newJsonPath}`).replace(/\$\{quote\}/g, '"');
childProcess.exec(externalDiffCommand, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(stdout);
  process.exit(0);
});
