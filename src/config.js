const path = require('path');
require('dotenv').config();

const getEnv = (variable) => {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
  return process.env[variable];
};

exports.PROVIDER_URL = getEnv('PROVIDER_URL');
exports.SCHEDULER_ADDRESS = getEnv('SCHEDULER_ADDRESS');
exports.CALENDAR_ID = getEnv('CALENDAR_ID');
exports.OWNER_NAME = getEnv('OWNER_NAME');
exports.OWNER_EMAIL = getEnv('OWNER_EMAIL');
exports.LAST_BLOCK_PATH = path.join(__dirname, '..', 'block_number');
