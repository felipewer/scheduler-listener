const fs = require('fs');
const util = require('util');
const { VError } = require('verror');

const fsWriteFile = util.promisify(fs.writeFile);
const fsReadFile = util.promisify(fs.readFile);

const blocTracker = (lastBlockPath) => {

  const getLastConsumed = () => (
    fsReadFile(lastBlockPath)
      .then(block => parseInt(block, 10))
      .catch(err => {
        if (err.code !== 'ENOENT') {
          const msg = 'Failed to read last consumed block number';
          throw new VError(err, msg);
        }
        return null;
      })
  );
  
  const setLastConsumed = (blockNumber) => (
    fsWriteFile(lastBlockPath, blockNumber)
      .catch(err => {
        const msg = 'Failed to save last consumed block number';
        throw new VError(err, msg);
      })
  );

  return { getLastConsumed, setLastConsumed };
};

module.exports = blocTracker;