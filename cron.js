'use strict';
const axios = require('axios');
const CronJob = require('cron').CronJob;
const apiUrl = 'https://api.faucet.matic.network'

let i = 0;
const addresses = ['0xf1684DaCa9FE469189A3202ae2dE25E80dcB90a1', '0x14F791eb0bd5060a4C954D6719fE4e94859Eb614', '0xAa99C54602c357D78430Ea897027e122D9f45376']

const getAddress = (i) => {
  return addresses[i];
}

const callingMATIC = new CronJob('*/1 * * * *', async () => {
  try {
    if (i >= addresses.length) i = 0;
    const currentAddress = getAddress(i);
    const res = await axios.post(
      `${apiUrl}/transferTokens`,
      {
        network: 'mumbai',
        address: currentAddress,
        token: 'maticToken'
      }
    ); 
    i++;
    console.log('res', currentAddress, res.data)
  } catch (error) {
    console.log('error', error)
  }
}, null, false, process.env.TIME_ZONE);

module.exports = {
	fetch: () => {
		callingMATIC.start();
	}
};

