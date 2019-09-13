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
 * @file index.js
 * @date 2019
 */
const Web3 = require('web3');
const constants = require('./common/constants');
const Helper = require('./common/helper');
const FilestorageContract = require('./FilestorageContract');
let streamSaver = null;
if (typeof window !== 'undefined') {
    streamSaver = require('streamsaver');
}

class FilestorageClient {

    /**
     * Initialization of Filestorage API client
     *
     * @class
     *
     * @param {string|Object} web3Provider - A URL of SKALE endpoint or one of the Web3 provider classes
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
    async downloadToFile(storagePath) {
        if (!streamSaver) {
            throw new Error('Method downloadToFile can only be used with a browser');
        }
        let re = /^(?:\/?|)(?:[\s\S]*?)((?:\.{1,2}|[^\/]+?|)(?:\.[^.\/]*|))(?:[\/]*)$/;
        const fileName = re.exec(storagePath)[1];
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
