const moment = require('moment');
const pino = require('pino')();
const { VError } = require('verror');

const { connect } = require('./web3_connector');
const calendar = require('./calendar');
const contract = require('./contract');
const { logAndExit } = require('./util');
const abi = require('../contract/scheduler_abi.json');
const credentials = require('../credentials.json');
const {
  CALENDAR_ID,
  OWNER_NAME,
  OWNER_EMAIL,
  PROVIDER_URL,
  SCHEDULER_ADDRESS,
  LAST_BLOCK_PATH
} = require('./config');
const blocTracker = require('./block_tracker')(LAST_BLOCK_PATH);

const auth = calendar.getAuth(credentials);

const listenerCallback = (error, data) => {
  if (error) {
    const msg = 'Failed to listen to contract events';
    return logAndExit(new VError(error, msg));
  }

  const { blockNumber, returnValues } = data;

  blocTracker.setLastConsumed(blockNumber)
    .catch(err => pino.error(err));

  const { name, email, company, date } = returnValues;
  const event = calendar.event(
    { name: OWNER_NAME, email: OWNER_EMAIL },
    name,
    company,
    email,
    moment.unix(date)
  );

  calendar.register(CALENDAR_ID, auth, event)
    .then(() => pino.info({ event }, 'Event registered'))
    .catch(err => pino.error(err));
};

connect(PROVIDER_URL).then((provider) => {
  pino.info(`Connected to ${PROVIDER_URL}`);
  return blocTracker.getLastConsumed().then(blockNumber => {
    const fromBlock = (blockNumber) ? blockNumber + 1 : 0;
    const scheduler = contract.init(provider, abi, SCHEDULER_ADDRESS);
    contract.listen(scheduler, 'NewAppointment', fromBlock, listenerCallback);
    pino.info(`Listening to events from block ${fromBlock} onwards`);
  });
}).catch(logAndExit);
