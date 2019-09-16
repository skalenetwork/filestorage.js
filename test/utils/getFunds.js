require('dotenv').config();
const Web3 = require('web3');
const testBalance = require('./constants').TEST_ACCOUNT_BALANCE;
const rootAccount = process.env.SCHAIN_OWNER;
const rootPrivateKey = process.env.SCHAIN_OWNER_PK;

let web3 = new Web3(process.env.SKALE_ENDPOINT);

async function getFunds(account) {
    let testBalanceWei = await web3.utils.toWei(testBalance, 'ether');
    let accountBalance = await web3.eth.getBalance(account);
    let rootBalance = await web3.eth.getBalance(rootAccount);
    if (accountBalance < testBalanceWei) {
        let valueToSend = testBalanceWei - accountBalance;
        if (rootBalance < valueToSend) {
            throw new Error('Insufficient funds for testing');
        }
        let tx = {
            from: rootAccount,
            gas: 21000,
            to: account,
            value: valueToSend
        };
        let signedTx = await web3.eth.accounts.signTransaction(tx, rootPrivateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
}

module.exports = getFunds;
