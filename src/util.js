const pino = require('pino')();

exports.logAndExit = (err) => {
  pino.error(err); 
  process.exit(err.code || 1);
};
