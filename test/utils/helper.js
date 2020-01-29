/**
 * @license
 * SKALE Filestorage-js
 * Copyright (C) 2019-Present SKALE Labs
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file helper.js* @date 2019
 */
require('dotenv').config();
const Web3 = require('web3');
const testBalance = require('./constants').TEST_ACCOUNT_BALANCE;
const helper = require('../../src/common/helper');
const rootPrivateKey = process.env.SCHAIN_OWNER_PK;
const web3 = new Web3(process.env.SKALE_ENDPOINT);
async function getFunds(account) {
    let rootAccount = web3.eth.accounts.privateKeyToAccount(rootPrivateKey).address;
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
            value: valueToSend,
            nonce: await web3.eth.getTransactionCount(rootAccount),
            chainId: await web3.eth.getChainId()
        };
        let signedTx = await web3.eth.accounts.signTransaction(tx, rootPrivateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
    return true;
}

async function reserveTestSpace(contract, account, space) {
    let rootAccount = web3.eth.accounts.privateKeyToAccount(rootPrivateKey).address;
    let txData = contract.methods.reserveSpace(account, space);
    return await helper.sendTransactionToContract(web3, rootAccount, rootPrivateKey, txData, 1000000);
}

module.exports.getFunds = getFunds;
module.exports.reserveTestSpace = reserveTestSpace;
