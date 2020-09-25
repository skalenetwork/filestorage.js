/**
 * @license
 * SKALE Filestorage-js
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
 * @file helper.js
 * @copyright SKALE Labs 2019-Present
 */

const fs = require('fs');
const Web3 = require('web3');
const constants = require('./constants');
const helper = require('../../src/common/helper');
require('dotenv').config();

const rootPrivateKey = process.env.SCHAIN_OWNER_PK;
const web3 = new Web3(process.env.SKALE_ENDPOINT);

async function getAddress(privateKey) {
    privateKey = helper.addBytesSymbol(privateKey);
    return await web3.eth.accounts.privateKeyToAccount(privateKey).address;
}

async function getFunds(account) {
    let rootAccount = await getAddress(rootPrivateKey);
    let testBalanceWei = await web3.utils.toWei(constants.TEST_ACCOUNT_BALANCE, 'ether');
    let accountBalance = await web3.eth.getBalance(account);
    let rootBalance = await web3.eth.getBalance(rootAccount);
    if (accountBalance < testBalanceWei) {
        let valueToSend = testBalanceWei - accountBalance;
        if (rootBalance < valueToSend) {
            throw new Error('Insufficient funds for testing');
        }
        let nonce = await web3.eth.getTransactionCount(rootAccount);
        let tx = {
            from: rootAccount,
            gas: 21000,
            to: account,
            value: valueToSend,
            nonce: nonce,
            chainId: await web3.eth.getChainId()
        };
        let signedTx = await web3.eth.accounts.signTransaction(tx, rootPrivateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
    return true;
}

async function reserveTestSpace(contract, account, space) {
    let rootAccount = await getAddress(rootPrivateKey);
    let txData = contract.methods.reserveSpace(account, space);
    return await helper.sendTransactionToContract(web3, rootAccount, rootPrivateKey, txData, 1000000);
}

function generateConfig() {
    let data = fs.readFileSync(constants.ARTIFACTS_FILE_PATH);
    let artifacts = JSON.parse(data);
    let skaledConfigPath = constants.CONFIG_FILE_PATH;
    let skaledConfig = require(skaledConfigPath);
    skaledConfig.accounts[artifacts.address] = {
        'code': artifacts.bytecode,
        'balance': '0',
        'nonce': '0',
        'storage': {
            '0x00': '0xffffffffff'
        }
    };
    fs.writeFileSync(skaledConfigPath, JSON.stringify(skaledConfig, null, '\t'));
}

module.exports.getFunds = getFunds;
module.exports.getAddress = getAddress;
module.exports.reserveTestSpace = reserveTestSpace;
module.exports.generateConfig = generateConfig;
