const Web3 = require('web3');

const init = (provider, abi, address) => {
  const web3 = new Web3(provider);
  return new web3.eth.Contract(abi, address);
};

const listen = (instance, eventSelector, eventHandler, errorHandler) => {
  const options = { fromBlock: 0, toBlock: 'latest' };
  instance.events[eventSelector](options)
    .on('data', ({ returnValues }) => eventHandler(returnValues))
    .on('error', errorHandler);
};

module.exports = { init, listen };
