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
 * @file index.js
 * @copyright SKALE Labs 2019-Present
 */

const Web3 = require('web3');
const constants = require('./common/constants');
const Helper = require('./common/helper');
const FilestorageContract = require('./FilestorageContract');

let streamSaver = null;
/* istanbul ignore next */
if (typeof window !== 'undefined') {
    streamSaver = require('streamsaver');
}

class FilestorageClient {

    /**
     * Initialization of Filestorage API client
     *
     * @class
     *
     * @param {string|object} web3Provider - A URL of SKALE endpoint or one of the Web3 provider classes
     * @param {boolean} [enableLogs=false] - Enable/disable console logs
     */
    constructor(web3Provider, enableLogs = false) {
        this.web3 = new Web3(web3Provider);
        this.contract = new FilestorageContract(this.web3);
        this.enableLogs = enableLogs;
    }

    /**
     * Upload file into Filestorage
     *
     * @function uploadFile
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path of uploaded file in account directory
     * @param {Buffer} fileBuffer - Uploaded file data
     * @param {string} [privateKey] - Account private key
     * @returns {string} Storage path
     */
    async uploadFile(address, filePath, fileBuffer, privateKey) {
        let fileSize = fileBuffer.length;
        await this.contract.startUpload(address, filePath, fileSize, privateKey);
        if (this.enableLogs) console.log('File was created!');

        let ptrPosition = 0;
        let i = 0;
        while (ptrPosition < fileSize) {
            let rawChunk = fileBuffer.slice(ptrPosition, ptrPosition +
                Math.min(fileSize - ptrPosition, constants.CHUNK_LENGTH));
            let chunk = Helper.bufferToHex(rawChunk);
            await this.contract.uploadChunk(address, filePath, ptrPosition, Helper.addBytesSymbol(chunk), privateKey);
            ptrPosition += chunk.length / 2;
            if (this.enableLogs) {
                console.log('Chunk ' + i + ' was loaded ' + ptrPosition);
                ++i;
            }
        }

        if (this.enableLogs) console.log('Checking file validity...');
        await this.contract.finishUpload(address, filePath, privateKey);
        if (this.enableLogs) console.log('File was uploaded!');
        return Helper.rmBytesSymbol(address).concat('/', filePath);
    }

    /**
     * Download file from Filestorage into browser downloads folder
     *
     * @function downloadToFile
     *
     * @param {string} storagePath - Path of the file in Filestorage
     */
    /* istanbul ignore next */
    async downloadToFile(storagePath) {
        if (!streamSaver) {
            throw new Error('Method downloadToFile can only be used with a browser');
        }
        const fileName = Helper.getBasename(storagePath);
        let wstream = streamSaver.createWriteStream(fileName).getWriter();
        await this._downloadFile(storagePath, wstream);
        wstream.close();
    }

    /**
     * Download file from Filestorage into buffer
     *
     * @function downloadToBuffer
     *
     * @param {string} storagePath - Path of the file in Filestorage
     * @returns {Buffer} - File data in bytes
     */
    async downloadToBuffer(storagePath) {
        return await this._downloadFile(storagePath);
    }

    /**
     * Delete file from Filestorage
     *
     * @function deleteFile
     *
     * @param {string} address - Account address
     * @param {string} filePath - Path to the file to be deleted
     * @param {string} [privateKey] - Account private key
     */
    async deleteFile(address, filePath, privateKey) {
        await this.contract.deleteFile(address, filePath, privateKey);
        if (this.enableLogs) console.log('File was deleted');
    }

    /**
     * Create directory in Filestorage
     *
     * @function createDirectory
     *
     * @param {string} address - Account address
     * @param {string} directoryPath - Path of the directory to be created
     * @param {string} [privateKey] - Account private key
     * @returns {string} Storage path
     */
    async createDirectory(address, directoryPath, privateKey) {
        await this.contract.createDirectory(address, directoryPath, privateKey);
        if (this.enableLogs) console.log('Directory was created');
        return Helper.rmBytesSymbol(address).concat('/', directoryPath);
    }

    /**
     * Delete directory from Filestorage
     *
     * @function deleteDirectory
     *
     * @param {string} address - Account address
     * @param {string} directoryPath - Path of the directory to be deleted
     * @param {string} [privateKey] - Account private key
     */
    async deleteDirectory(address, directoryPath, privateKey) {
        await this.contract.deleteDirectory(address, directoryPath, privateKey);
        if (this.enableLogs) console.log('Directory was deleted');
    }

    /**
     * List information about content of the directory
     *
     * @function listDirectory
     *
     * @param {string} storagePath - Path of the directory in Filestorage
     * @returns {Array.<{name:string, storagePath:string, isFile:boolean, size:number, status:number,
     * uploadingProgress:number}|{name:string, storagePath:string, isFile:boolean}>} - List of content:
     * files or directories
     */
    async listDirectory(storagePath) {
        if (storagePath.slice(-1) !== '/') storagePath += '/';
        let rawContent = await this.contract.listDirectory(storagePath);
        let content = rawContent.map(contentInfo => {
            let contentStoragePath = storagePath.concat(contentInfo['name']);
            let contentInfoObject = {
                name: contentInfo['name'],
                storagePath: contentStoragePath,
                isFile: contentInfo['isFile']
            };
            if (!contentInfoObject.isFile) {return contentInfoObject;}
            let chunkStatusList = contentInfo['isChunkUploaded'];
            let uploadedChunksCount = chunkStatusList.filter(x => x === true).length;
            let uploadingProgress = (chunkStatusList.length === 0) ? 100 :
                Math.floor(uploadedChunksCount / chunkStatusList.length * 100);
            let fileInfoObject = {
                size: Number(contentInfo['size']),
                status: Number(contentInfo['status']),
                uploadingProgress: uploadingProgress
            };
            return Object.assign(contentInfoObject, fileInfoObject);
        });
        return content;
    }

    /**
     * Reserve space in Filestorage for certain address. Allowed only for address with ALLOCATOR_ROLE
     *
     * @function reserveSpace
     *
     * @param {string} allocatorAddress - Address with ALLOCATOR_ROLE
     * @param {string} addressToReserve - Address to reserve space for
     * @param {number} reservedSpace - Reserved space in bytes
     * @param {string} [privateKey] - Allocator private key
     */
    async reserveSpace(allocatorAddress, addressToReserve, reservedSpace, privateKey) {
        await this.contract.reserveSpace(allocatorAddress, addressToReserve, reservedSpace, privateKey);
        if (this.enableLogs) console.log('Space was allocated');
    }

    /**
     * Grant allocator role for certain address. Allowed only for DEFAULT_ADMIN
     *
     * @function grantAllocatorRole
     *
     * @param {string} adminAddress - Address with DEFAULT_ADMIN_ROLE
     * @param {string} allocatorAddress - Address to grant role for
     * @param {string} [privateKey] - Admin private key
     */
    async grantAllocatorRole(adminAddress, allocatorAddress, privateKey) {
        await this.contract.grantAllocatorRole(adminAddress, allocatorAddress, privateKey);
        if (this.enableLogs) console.log('Allocator role was granted');
    }

    /**
     * Get information about reserved space for account
     *
     * @function getReservedSpace
     *
     * @param {string} address - Account address
     * @returns {number} Reserved space in bytes
     */
    async getReservedSpace(address) {
        let space = await this.contract.getReservedSpace(address);
        return Number(space);
    }

    /**
     * Get information about occupied space for account
     *
     * @function getOccupiedSpace
     *
     * @param {string} address - Account address
     * @returns {number} Occupied space in bytes
     */
    async getOccupiedSpace(address) {
        let space = await this.contract.getOccupiedSpace(address);
        return Number(space);
    }

    /**
     * Get information about total allocated space for Filestorage
     *
     * @function getTotalSpace
     *
     * @returns {number} Total space in Filestorage in bytes
     */
    async getTotalSpace() {
        let space = await this.contract.getTotalSpace();
        return Number(space);
    }

    /**
     * Get information about total reserved space in Filestorage
     *
     * @function getTotalReservedSpace
     *
     * @returns {number} Total reserved space in Filestorage in bytes
     */
    async getTotalReservedSpace() {
        let space = await this.contract.getTotalReservedSpace();
        return Number(space);
    }

    async _downloadFile(storagePath, stream) {
        let ptrPosition = 0;
        let i = 0;
        let buffers = [];
        const fileSize = await this.contract.getFileSize(storagePath);
        if (this.enableLogs) console.log('File size: ', fileSize);

        while (ptrPosition < fileSize) {
            let currentLength = Math.min(constants.CHUNK_LENGTH, fileSize - ptrPosition);
            let rawData = await this.contract.readChunk(storagePath, ptrPosition, currentLength);
            let data = Helper.concatBytes32Array(rawData, 2 * currentLength);
            // eslint-disable-next-line
            let buffer = new Buffer.from(data, 'hex');
            /* istanbul ignore next */
            if (stream) stream.write(buffer);
            buffers.push(buffer);
            ptrPosition += currentLength;
            if (this.enableLogs) {
                console.log('Chunk ' + i + ' was downloaded! Received bytes:' + ptrPosition);
                ++i;
            }
        }
        if (this.enableLogs) console.log('File was downloaded!');
        return Buffer.concat(buffers);
    }
}

module.exports = FilestorageClient;
module.exports.FilestorageContract = FilestorageContract;
