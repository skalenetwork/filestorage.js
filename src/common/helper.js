/**
 * @license
 * SKALE Filestorage-js
 * Copyright (C) 2019-Present SKALE Labs
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file helper.js
 * @date 2019
 */
const constants = require('./constants');
const InvalidCredentialsException = require('../exceptions/InvalidCredentialsException');
const FilestorageContractException = require('../exceptions/FilestorageContractException');
const PRIVATE_KEY_REGEX = /^(0x)?[0-9a-f]{64}$/i;

// TODO: remove 0 gasPrice
const Helper = {

    ensureStartsWith0x(str) {
        if (str.length < 2) {return false;}
        return (str[0] === '0' && str[1] === 'x');
    },

    addBytesSymbol(str) {
        if (this.ensureStartsWith0x(str)) return str;
        return '0x' + str;
    },

    rmBytesSymbol(str) {
        if (!this.ensureStartsWith0x(str)) return str;
        return str.slice(2);
    },

    bufferToHex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },

    concatBytes32Array(data, outputLength) {
        return data.map(x => this.rmBytesSymbol(x)).join('').slice(0, outputLength);
    },

    validatePrivateKey(privateKey) {
        if (!PRIVATE_KEY_REGEX.test(privateKey)) {
            throw new InvalidCredentialsException(constants.errorMessages.INVALID_PRIVATEKEY);
        }
    },

    async signAndSendTransaction(web3, account, privateKey, transactionData, gas) {
        let encoded = transactionData.encodeABI();
        let contractAddress = transactionData._parent._address;
        let accountFromPrivateKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;

        if (account !== accountFromPrivateKey && account !== this.rmBytesSymbol(accountFromPrivateKey)) {
            throw new InvalidCredentialsException(constants.errorMessages.INVALID_KEYPAIR);
        }
        let nonce = await web3.eth.getTransactionCount(account);
        let tx = {
            from: account,
            data: encoded,
            gas: gas,
            gasPrice: 0,
            to: contractAddress,
            nonce: nonce
        };

        let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    },

    async sendTransaction(web3, account, transactionData, gas) {
        let nonce = await web3.eth.getTransactionCount(account);
        return await transactionData.send({
            from: account,
            gas: gas,
            gasPrice: 0,
            nonce: nonce
        });
    },

    async sendTransactionToContract(web3, account, privateKey, transactionData, gas) {
        let result;
        try {
            if (typeof privateKey === 'string' && privateKey.length > 0) {
                if (!this.ensureStartsWith0x(privateKey)) {
                    privateKey = '0x' + privateKey;
                }
                Helper.validatePrivateKey(privateKey);
                result = await Helper.signAndSendTransaction(web3, account, privateKey, transactionData, gas);
            } else {
                result = await Helper.sendTransaction(web3, account, transactionData, gas);
            }
            return result;
        } catch (error) {
            if (error.message.includes(constants.errorMessages.REVERTED_TRANSACTION)){
                let errorMessage = error.message.substr(constants.errorMessages.REVERTED_TRANSACTION.length);
                let revertReason = JSON.parse(errorMessage).revertReason;
                if (revertReason)
                    throw new FilestorageContractException(revertReason);
                else
                    throw new FilestorageContractException(constants.errorMessages.FAILED_TRANSACTION);
            } else {
                throw error;
            }
        }
    }
};

module.exports = Helper;
