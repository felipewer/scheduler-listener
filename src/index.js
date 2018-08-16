const logger = require('pino')();
const { VError } = require('verror');

const {
  CALENDAR_ID,
  OWNER_NAME,
  OWNER_EMAIL,
  PROVIDER_URL,
  SCHEDULER_ADDRESS,
  MIN_HOUR,
  MAX_HOUR,
  TIMEZONE
} = require('./config');

const web3Conn = require('./web3_connector');
const { logAndExit } = require('./util');
const credentials = require('../credentials.json');
const schedulerABI = require('../contract/scheduler_abi.json');
const contract = require('./contract')(schedulerABI, SCHEDULER_ADDRESS);

const owner = { name: OWNER_NAME, email: OWNER_EMAIL };
const timeLimits = { minHour: MIN_HOUR, maxHour: MAX_HOUR, timezone: TIMEZONE };
const calendar = require('./calendar')(CALENDAR_ID, credentials, owner, timeLimits);

const eventCB = (error, data) => {
  if (error) {
    const msg = 'Failed to listen to contract events';
    return logAndExit(new VError(error, msg));
  }

  const { returnValues: { name, email, company, date } } = data;
  calendar.comingEvents()
    .then(events => calendar.assertTimeIsFree(date, events))
    .then(() => calendar.buildEvent(name, company, email, date))
    .then(calendar.register)
    .then((event) => logger.info({ event }, 'Event registered'))
    .catch(err => logger.error(err));
};

web3Conn.connect(PROVIDER_URL)
  .then((provider) => {
    logger.info(`Connected to ${PROVIDER_URL}`);
    contract(provider).listen('NewAppointment', eventCB);
    logger.info('Listening to NewAppointment events');
  })
  .catch(logAndExit);
