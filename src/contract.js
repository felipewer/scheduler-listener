const Web3 = require('web3');

const init = (provider, abi, address) => {
  const web3 = new Web3(provider);
  return new web3.eth.Contract(abi, address);
};

const listen = (instance, selector, fromBlock, callback) => {
  const options = { fromBlock, toBlock: 'latest' };
  instance.events[selector](options, callback);
};

module.exports = { init, listen };
