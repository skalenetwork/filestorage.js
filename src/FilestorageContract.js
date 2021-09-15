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
 * @file FilestorageContract.js
 * @copyright SKALE Labs 2019-Present
 */

const filestorageArtifacts = require('@skalenetwork/filestorage');
const constants = require('./common/constants');
const transactions = require('./common/transactions');

class FilestorageContract {

    /**
     * Initialization of FilestorageContract - js wrapper for solidity smart contract
     *
     * @class
     *
     * @param {object} web3 - Web3 instance
     */
    constructor(web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(filestorageArtifacts.abi, filestorageArtifacts.address);
    }

    /**
     * Javascript wrapper for solidity function startUpload. Creates empty file of a preset size on SKALE chain node
     *
     * @function startUpload
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path of uploaded file in account directory
     * @param {number} size - Size of uploaded file
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async startUpload(address, filePath, size, privateKey = '') {
        let txData = this.contract.methods.startUpload(filePath, size);
        return await transactions.send(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function uploadChunk. Writes chunk to the file to specific position
     *
     * @function uploadChunk
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path of the file in which chunk will be written
     * @param {number} position - Position in the file from which chunk will be written
     * @param {string} data - Chunk data in hex format, started with 0x
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async uploadChunk(address, filePath, position, data, privateKey = '') {
        let txData = this.contract.methods.uploadChunk(filePath, position, data);
        return await transactions.send(this.web3, address, privateKey, txData, constants.WRITING_GAS);
    }

    /**
     * Javascript wrapper for solidity function deleteFile. Deletes file from SKALE chain node
     *
     * @function deleteFile
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path to the file to be deleted
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async deleteFile(address, filePath, privateKey = '') {
        let txData = this.contract.methods.deleteFile(filePath);
        return await transactions.send(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function finishUpload. Finishes uploading of the file. Checks whether all
     * chunks are uploaded correctly
     *
     * @function finishUpload
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path of uploaded file in account directory
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async finishUpload(address, filePath, privateKey = '') {
        let txData = this.contract.methods.finishUpload(filePath);
        return await transactions.send(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function readChunk. Reads chunk from file from specific position
     *
     * @function readChunk
     *
     * @param {string} storagePath - Path of the file in Filestorage
     * @param {number} position - Position in the file from which chunk will be read
     * @param {number} length - Size of read data in bytes
     * @returns {Array.<string>} Chunk data splitted into 32 byte hex strings
     */
    async readChunk(storagePath, position, length) {
        return await this.contract.methods.readChunk(storagePath, position, length).call();
    }

    /**
     * Javascript wrapper for solidity function getFileStatus. Returns status of the file:
     * 0 - file does not exist,
     * 1 - file is created but uploading not finished yet,
     * 2 - file is fully uploaded to Filestorage
     *
     * @function getFileStatus
     *
     * @param {string} storagePath - Path of the file in Filestorage
     * @returns {number} File status
     */
    async getFileStatus(storagePath) {
        return await this.contract.methods.getFileStatus(storagePath).call();
    }

    /**
     * Javascript wrapper for solidity function getFileSize. Get size of the file in bytes
     *
     * @function getFileSize
     *
     * @param {string} storagePath - Path of the file in Filestorage
     * @returns {string} Size of the file in bytes
     */
    async getFileSize(storagePath) {
        return await this.contract.methods.getFileSize(storagePath).call();
    }

    /**
     * Javascript wrapper for solidity function createDir. Create directory in Filestorage
     *
     * @function createDirectory
     *
     * @param {string} address - Account address
     * @param {string} directoryPath - Path of the directory to be created
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async createDirectory(address, directoryPath, privateKey = '') {
        let txData = this.contract.methods.createDirectory(directoryPath);
        return await transactions.send(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function deleteDir. Delete directory from Filestorage
     *
     * @function deleteDirectory
     *
     * @param {string} address - Account address
     * @param {string} directoryPath - Path of the directory to be created
     * @param {string} [privateKey] - Account private key
     * @returns {object} Transaction information
     */
    async deleteDirectory(address, directoryPath, privateKey = '') {
        let txData = this.contract.methods.deleteDirectory(directoryPath);
        return await transactions.send(this.web3, address, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function listDir. List information about content of the directory
     *
     * @function listDirectory
     *
     * @param {string} storagePath - Path of the directory in Filestorage
     * @returns {Array.<{name:string, isFile:boolean, status:number, status:string, isChunkUploaded:boolean[]}>} -
     * List of content
     */
    async listDirectory(storagePath) {
        return await this.contract.methods.listDirectory(storagePath).call();
    }

    /**
     * Javascript wrapper for solidity function reserveSpace. Reserve space in Filestorage for certain address.
     * Allowed only for sChain owner
     *
     * @function reserveSpace
     *
     * @param {string} ownerAddress - sChain owner address
     * @param {string} addressToReserve - Address to reserve space for
     * @param {number} reservedSpace - Reserved space in bytes
     * @param {string} [privateKey] - sChain owner private key
     * @returns {object} Transaction information
     */
    async reserveSpace(ownerAddress, addressToReserve, reservedSpace, privateKey = '') {
        let txData = this.contract.methods.reserveSpace(addressToReserve, reservedSpace);
        return await transactions.send(this.web3, ownerAddress, privateKey, txData, constants.STANDARD_GAS);
    }

    /**
     * Javascript wrapper for solidity function getReservedSpace. Get information about reserved space for account
     *
     * @function getReservedSpace
     *
     * @param {string} address - Account address
     * @returns {number} Reserved space in bytes
     */
    async getReservedSpace(address) {
        return await this.contract.methods.getReservedSpace(address).call();
    }

    /**
     * Javascript wrapper for solidity function getOccupiedSpace. Get information about occupied space for account
     *
     * @function getReservedSpace
     *
     * @param {string} address - Account address
     * @returns {number} Occupied space in bytes
     */
    async getOccupiedSpace(address) {
        return await this.contract.methods.getOccupiedSpace(address).call();
    }

    /**
     * Javascript wrapper for solidity function getOccupiedSpace. Get information about total allocated space for
     * Filestorage
     *
     * @function getReservedSpace
     *
     * @returns {number} Total space in Filestorage in bytes
     */
    async getTotalSpace() {
        return await this.contract.methods.getTotalStorageSpace().call();
    }

    /**
     * Javascript wrapper for solidity function getOccupiedSpace. Get information about total reserved space in
     * Filestorage
     *
     * @function getReservedSpace
     *
     * @returns {number} Total reserved space in Filestorage in bytes
     */
    async getTotalReservedSpace() {
        return await this.contract.methods.getTotalReservedSpace().call();
    }
}

module.exports = FilestorageContract;
