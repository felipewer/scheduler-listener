const logger = require('pino')();

exports.logAndExit = (err) => {
  logger.error(err); 
  process.exit(err.code || 1);
};
