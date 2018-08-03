const Web3 = require('web3');

const connect = (providerUrl) => {
  const provider = new Web3.providers.WebsocketProvider(providerUrl);
  const web3 = new Web3(provider);
  return web3.eth.net.isListening()
    .then(() => provider)
    .catch(() => Error('Error connecting to web3 provider.'));
};

module.exports = { connect };
