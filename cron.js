'use strict';
const axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC));
const CronJob = require('cron').CronJob;
const apiUrl = 'https://api.faucet.matic.network'
const recipients = require('./accounts.json');
const beneficiary = '0xa7364C972BCB10328A754fd28741cB50b663134A'

let i = 0;

const callingMATIC = new CronJob('*/1 * * * *', async () => {
  try {
    if (i >= recipients.length) i = 0;
    const currentRecipient = recipients[i];
    const balance = await web3.eth.getBalance(currentRecipient.address);
    if (Number(balance) >= 10000000000000000000) { // 10 ether
      const gasPrice = await web3.eth.getGasPrice();
      const nonce = await web3.eth.getTransactionCount(currentRecipient.address);
  
      const rawTransaction = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice * 1.1),
        from: currentRecipient.address,
        to: beneficiary,
        value: Number(balance) - 100000000000000000
      };

      const gasLimit = await web3.eth.estimateGas(rawTransaction);

      const gasLimitHex = web3.utils.toHex(gasLimit);
      rawTransaction.gasLimit = gasLimitHex;
  
      const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, currentRecipient.privateKey);
      await web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .on('receipt', ({ transactionHash }) => {
        console.log(`Transfer to: ${beneficiary} ${process.env.EXPLORER}/tx/${transactionHash}`);
      })
      .catch((err) => {
        console.log('error transfer', err);
      });
    } 
    
    const res = await axios.post(
      `${apiUrl}/transferTokens`,
      {
        network: 'mumbai',
        address: currentRecipient.address,
        token: 'maticToken'
      }
    ); 
    i++;
    console.log('res', currentRecipient.address, res.data)
  } catch (error) {
    console.log('error', error)
  }
}, null, false, process.env.TIME_ZONE);

module.exports = {
	fetch: () => {
		callingMATIC.start();
	}
};

