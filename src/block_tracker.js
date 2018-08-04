const fs = require('fs');
const path = require('path');
const util = require('util');

const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);

const lastConsumed = (blockNumber = null) => {
  const filePath = path.join(__dirname, '..', 'block_number');
  if (blockNumber){
    return fsWriteFile(filePath, blockNumber);
  } else {
    return fsReadFile(filePath).then(block => parseInt(block, 10))
      .catch(err => {
        if (err.code !== 'ENOENT') throw err;
        return null;
      });
  }
};

module.exports = { lastConsumed };