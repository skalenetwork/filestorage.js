/**
 * @license
 * SKALE Filestorage-js
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
 * @file helper.test.js
 * @copyright SKALE Labs 2019-Present
 */
const helper = require('../src/common/helper');
const transactions = require('../src/common/transactions');
const constants = require('../src/common/constants');
const FilestorageContract = require('../src/FilestorageContract');
const testHelper = require('./utils/helper');

const Web3 = require('web3');
let randomstring = require('randomstring');
const chai = require('chai');

const assert = chai.assert;
chai.should();
chai.use(require('chai-as-promised'));

require('dotenv').config();

describe('Helper', function () {
    const rejectedTransactionErrorMessage = 'Returned error: Transaction rejected by user.';
    describe('bufferToHex', function () {
        it('should return hex string from random buffer', function () {
            let string = randomstring.generate();
            let buffer = Buffer.from(string);
            let hex = helper.bufferToHex(buffer);
            assert.isNotNull(hex, 'value is undefined');
        });

        it('should return hex string from empty buffer', function () {
            let buffer = Buffer.from('');
            let hex = helper.bufferToHex(buffer);
            assert.isString(hex, 'Value is not string');
        });
    });

    describe('ensureStartsWith0x', function () {
        it('should return false if length < 2', function () {
            let result = helper.ensureStartsWith0x('A');
            assert.isFalse(result);
        });
    });

    describe('getBasename', function () {
        it('should return posix basename', function () {
            let testString = 'aa/bb/cc/dd/ee';
            let result = helper.getBasename(testString);
            assert.equal(result, 'ee');
        });

        it('should return string itself if / are absent', function () {
            let testString = 'test';
            let result = helper.getBasename(testString);
            assert.equal(result, 'test');
        });

        it('should return string before last /', function () {
            let testString = 'test/';
            let result = helper.getBasename(testString);
            assert.equal(result, 'test');
        });

        it('should return string before last /', function () {
            let testString = '/test';
            let result = helper.getBasename(testString);
            assert.equal(result, 'test');
        });

        it('should return empty string', function () {
            let testString = '';
            let result = helper.getBasename(testString);
            assert.equal(result, '');
        });
    });

    describe('validatePrivateKey', function () {
        const privateKeyLength = 64;
        const fullPrivateKeyLength = 66;
        function checkPrivateKey(key) {
            try {
                helper.validatePrivateKey(key);
            } catch (error) {
                return false;
            }
            return true;
        }

        it('should success for key of 66 length, started with 0x, contained only hex symbols', function () {
            let key = helper.addBytesSymbol(randomstring.generate({charset: 'hex', length: privateKeyLength}));
            let status = checkPrivateKey(key);
            assert.isOk(status);
        });

        it('should fail for key of 66 length, started not with 0x, contained only hex symbols', function () {
            let key = randomstring.generate({charset: 'hex', length: fullPrivateKeyLength});
            let status = checkPrivateKey(key);
            assert.isFalse(status);
        });

        it('should fail for key more that 66 length, started with 0x, contained only hex symbols', function () {
            let key = helper.addBytesSymbol(randomstring.generate({
                charset: 'hex',
                length: privateKeyLength + Math.floor(Math.random() * 100) + 1
            }));
            let status = checkPrivateKey(key);
            assert.isFalse(status);
        });

        it('should fail for key less that 66 length, started with 0x, contained only hex symbols', function () {
            let key = helper.addBytesSymbol(randomstring.generate({
                charset: 'hex',
                length: Math.floor(Math.random() * (privateKeyLength - 1))
            }));
            let status = checkPrivateKey(key);
            assert.isFalse(status);
        });

        it('should fail for key of 66 length, started with 0x, contained not only hex symbols', function () {
            let key = helper.addBytesSymbol(randomstring.generate({
                charset: 'alphanumeric',
                length: privateKeyLength
            }));
            let status = checkPrivateKey(key);
            assert.isFalse(status);
        });

        it('should fail on random string', function () {
            let key = randomstring.generate();
            let status = checkPrivateKey(key);
            assert.isFalse(status);
        });
    });

    describe('transactions', function () {
        let privateKey = process.env.PRIVATEKEY;
        let address;
        let web3;
        let contract;
        let txData;
        before(async function () {
            address = testHelper.getAddress(privateKey);
            web3 = new Web3(process.env.SKALE_ENDPOINT);
            contract = new FilestorageContract(web3).contract;
            txData = contract.methods.startUpload(randomstring.generate(), 0);
            await testHelper.getFunds(address);
        });

        it('should send transaction with privateKey', async function () {
            let result = await transactions.send(web3, address, privateKey, txData,
                constants.STANDARD_GAS);
            assert.isTrue(result['status']);
        });

        it('should throw exception for transaction without privateKey', async function () {
            await transactions.send(web3, address, '', txData, constants.STANDARD_GAS)
                .should
                .eventually
                .rejectedWith(rejectedTransactionErrorMessage);
        });
    });
});
