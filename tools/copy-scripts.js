const path = require('path');
const fs = require('fs/promises');

fs.copyFile(path.resolve(__dirname, '../node_modules/jsonata/jsonata.js'), 'src/web-root/libs/jsonata.js')
  .catch(err => console.log('[copy-scripts.js] error: ', err))
  .then(() => console.log('[copy-scripts.js] libs updated'));
