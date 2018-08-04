const moment = require('moment');
const { connect } = require('./web3_connector');
const calendar = require('./calendar');
const contract = require('./contract');
const blocTracker = require('./block_tracker');
const abi = require('../contract/scheduler_abi.json');
const credentials = require('../credentials.json');
const {
  CALENDAR_ID,
  OWNER_NAME,
  OWNER_EMAIL,
  PROVIDER_URL,
  SCHEDULER_ADDRESS
} = require('./config');

const auth = calendar.getAuth(credentials);

const onEvent = (blockNumber, { name, email, company, date }) => {
  const event = calendar.event(
    { name: OWNER_NAME, email: OWNER_EMAIL },
    name,
    company,
    email,
    moment.unix(date)
  );
  calendar.register(CALENDAR_ID, auth, event)
    .then(() => blocTracker.lastConsumed(blockNumber))
    .then(() => console.log('Event registered:', JSON.stringify(event)))
    .catch(console.error);
};

const onError = err => {
  throw err;
};

connect(PROVIDER_URL).then((provider) => {
  console.log(`Connected to ${PROVIDER_URL}`);
  return blocTracker.lastConsumed().then(blockNumber => {
    const fromBlock = (blockNumber) ? blockNumber + 1 : 0;
    const scheduler = contract.init(provider, abi, SCHEDULER_ADDRESS);
    contract.listen(scheduler, 'NewAppointment', fromBlock, onError, onEvent);
    console.log(`Listening to NewAppointment events from block ${fromBlock} onwards`);
  });
}).catch(onError);
