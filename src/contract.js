const Web3 = require('web3');

const contract = (abi, address) => provider => {

  const listen = (selector, fromBlock, callback) => {
    const options = { fromBlock, toBlock: 'latest' };
    const web3 = new Web3(provider);
    const instance = new web3.eth.Contract(abi, address);
    instance.events[selector](options, callback);
  };

  return { listen };
};

module.exports = contract;
