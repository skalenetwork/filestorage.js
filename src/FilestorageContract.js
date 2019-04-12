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
 * @file FilestorageContract.js
 * @date 2019
 */
const constants = require('./common/constants');
const configJson = require('./contracts_config.json');
const Helper = require('./common/helper');

const abi = configJson[constants.FILESTORAGE_CONTRACTNAME]['abi'];
const contractAddress = configJson[constants.FILESTORAGE_CONTRACTNAME]['address'];
class FilestorageContract {

    /**
     * Initialization of FilestorageContract - js wrapper for solidity smart contract
     *
     * @constructor
     *
     * @param {object} web3 - Web3 instance.
     */
    constructor(web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(abi, contractAddress);
    }

    /**
     * Javascript wrapper for solidity function startUpload. Creates empty file of a preset size on SKALE chain node
     *
     * @method startUpload
     *
     * @param {string} address - Account address.
     * @param {string} name - Name of uploaded file.
     * @param {number} size - Size of uploaded file.
     * @param {string} [privateKey] - Account private key.
     * @returns {object} Transaction information
     */
    async startUpload(address, name, size, privateKey = '') {
        let txData = this.contract.methods.startUpload(name, size);
        return await Helper.sendTransactionToContract(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function uploadChunk. Writes chunk to the file to specific position
     *
     * @method uploadChunk
     *
     * @param {string} address - Account address.
     * @param {string} name - Name of the file in which chunk will be written.
     * @param {number} position - Position in the file from which chunk will be written.
     * @param {string} data - Chunk data in hex format, started with 0x
     * @param {string} [privateKey] - Account private key.
     * @returns {object} Transaction information
     */
    async uploadChunk(address, name, position, data, privateKey = '') {
        let txData = this.contract.methods.uploadChunk(name, position, data);
        return await Helper.sendTransactionToContract(this.web3, address, privateKey, txData, constants.WRITING_GAS);
    }

    /**
     * Javascript wrapper for solidity function deleteFile. Deletes file from SKALE chain node
     *
     * @method deleteFile
     *
     * @param {string} address - Account address.
     * @param {string} name - Name of the file to be deleted.
     * @param {string} [privateKey] - Account private key.
     * @returns {object} Transaction information
     */
    async deleteFile(address, name, privateKey = '') {
        let txData = this.contract.methods.deleteFile(name);
        return await Helper.sendTransactionToContract(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function finishUpload. Finishes uploading of the file. Checks whether all
     * chunks are uploaded correctly
     *
     * @method finishUpload
     *
     * @param {string} address - Account address.
     * @param {string} name - Name of uploaded file.
     * @param {string} [privateKey] - Account private key.
     * @returns {object} Transaction information
     */
    async finishUpload(address, name, privateKey = '') {
        let txData = this.contract.methods.finishUpload(name);
        return await Helper.sendTransactionToContract(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function readChunk. Reads chunk from file from specific position
     *
     * @method readChunk
     *
     * @param {string} storagePath - Path of the file in Filestorage.
     * @param {number} position - Position in the file from which chunk will be read.
     * @param {number} length - Size of read data in bytes.
     * @returns {Array.<string>} Chunk data splitted into 32 byte hex strings.
     */
    async readChunk(storagePath, position, length) {
        let result = await this.contract.methods.readChunk(storagePath, position, length).call();
        return result;
    }

    /**
     * Javascript wrapper for solidity function getFileStatus. Returns status of the file:
     * 0 - file does not exist,
     * 1 - file is created but uploading not finished yet,
     * 2 - file is fully uploaded to Filestorage
     *
     * @method getFileStatus
     *
     * @param {string} storagePath - Path of the file in Filestorage.
     * @returns {number} File status
     */
    async getFileStatus(storagePath) {
        let result = await this.contract.methods.getFileStatus(storagePath).call();
        return result;
    }

    /**
     * Javascript wrapper for solidity function getFileSize. Get size of the file in bytes
     *
     * @method getFileSize
     *
     * @param {string} storagePath - Path of the file in Filestorage.
     * @returns {string} Size of the file in bytes
     */
    async getFileSize(storagePath) {
        let result = await this.contract.methods.getFileSize(storagePath).call();
        return result;
    }

    /**
     * Javascript wrapper for solidity function getFileInfoList. Get information about files in Filestorage of the
     * specific account
     *
     * @method getFileInfoList
     *
     * @param {string} address - Account address.
     * @returns {{name:string, size:number, storagePath:string, isChunkUploaded:boolean[]}} - File description.
     */
    async getFileInfoList(address) {
        let result = await this.contract.methods.getFileInfoList(address).call();
        return result;
    }
}

module.exports = FilestorageContract;
