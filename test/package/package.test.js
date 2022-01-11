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
 * @file package.test.js
 * @copyright SKALE Labs 2019-Present
 */
const Filestorage = require('@skalenetwork/filestorage.js');
const FilestorageContract = require('@skalenetwork/filestorage.js').FilestorageContract;
const Web3 = require('web3');
require('dotenv').config();

const chai = require('chai');
const assert = chai.assert;
chai.should();
chai.use(require('chai-as-promised'));

describe('Test npm package', function () {
    describe('Test constructor', function () {
        it('should initialize with web3', function () {
            const web3Provider = new Web3.providers.HttpProvider(process.env.SKALE_ENDPOINT);
            let web3 = new Web3(web3Provider);
            let filestorageClient = new Filestorage(web3);
            assert.instanceOf(filestorageClient, Filestorage);
            assert.instanceOf(filestorageClient.web3, Web3);
            assert.instanceOf(filestorageClient.contract, FilestorageContract);
        });

        it('should initialize with http endpoint', function () {
            let filestorageClient = new Filestorage(process.env.SKALE_ENDPOINT);
            assert.instanceOf(filestorageClient, Filestorage);
            assert.instanceOf(filestorageClient.web3, Web3);
            assert.instanceOf(filestorageClient.contract, FilestorageContract);
        });

        it('should initialize with enabled logs', function () {
            let filestorageClient = new Filestorage(process.env.SKALE_ENDPOINT, true);
            assert.isTrue(filestorageClient.enableLogs);
        });
    });
});
