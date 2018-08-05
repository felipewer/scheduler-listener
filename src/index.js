const moment = require('moment');
const logger = require('pino')();
const { VError } = require('verror');

const {
  CALENDAR_ID,
  OWNER_NAME,
  OWNER_EMAIL,
  PROVIDER_URL,
  SCHEDULER_ADDRESS,
  LAST_BLOCK_PATH
} = require('./config');

const { connect } = require('./web3_connector');
const calendar = require('./calendar');
const { logAndExit } = require('./util');
const schedulerABI = require('../contract/scheduler_abi.json');
const credentials = require('../credentials.json');
const blocTracker = require('./block_tracker')(LAST_BLOCK_PATH);
const contract = require('./contract')(schedulerABI, SCHEDULER_ADDRESS);

const auth = calendar.getAuth(credentials);

const eventCB = (error, data) => {
  if (error) {
    const msg = 'Failed to listen to contract events';
    return logAndExit(new VError(error, msg));
  }

  const { blockNumber, returnValues } = data;

  blocTracker.setLastConsumed(blockNumber)
    .catch(err => logger.error(err));

  const { name, email, company, date } = returnValues;
  const event = calendar.event(
    { name: OWNER_NAME, email: OWNER_EMAIL },
    name,
    company,
    email,
    moment.unix(date)
  );

  calendar.register(CALENDAR_ID, auth, event)
    .then(() => logger.info({ event }, 'Event registered'))
    .catch(err => logger.error(err));
};

connect(PROVIDER_URL)
  .then((provider) => {
    logger.info(`Connected to ${PROVIDER_URL}`);
    return blocTracker.getLastConsumed().then(blockNumber => {
      const fromBlock = (blockNumber) ? blockNumber + 1 : 0;
      contract(provider).listen('NewAppointment', fromBlock, eventCB);
      logger.info(`Listening to events from block ${fromBlock} onwards`);
    });
  })
  .catch(logAndExit);
