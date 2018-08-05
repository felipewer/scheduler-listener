const Web3 = require('web3');
const { VError } = require('verror'); 

const connect = (providerUrl) => {
  const provider = new Web3.providers.WebsocketProvider(providerUrl);
  const web3 = new Web3(provider);
  return web3.eth.net.isListening()
    .then(() => provider)
    .catch(err => {
      const msg = 'Error connecting to web3 provider %s';
      throw new VError(err, msg, providerUrl);
    });
};

module.exports = { connect };
