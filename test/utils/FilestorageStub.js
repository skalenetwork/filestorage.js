let Filestorage = require('../../src/index');
let constants = require('../../src/common/constants');
let Helper = require('../../src/common/helper');

module.exports = class FilestorageStub {
    constructor(filestorage) {
        this.filestorage = filestorage;
    }

    async downloadToBuffer(storagePath) {
        return this.filestorage.downloadToBuffer(storagePath);
    }

    async uploadFile(address, filePath, fileBuffer, privateKey) {
        let fileSize = fileBuffer.length;
        await this.filestorage.contract.startUpload(address, filePath, fileSize, privateKey);
        if (this.filestorage.enableLogs) console.log('File was created!');

        let ptrPosition = 0;
        let i = 0;
        let txs = [];
        while (ptrPosition < fileSize) {
            let rawChunk = fileBuffer.slice(ptrPosition, ptrPosition +
                Math.min(fileSize - ptrPosition, constants.CHUNK_LENGTH));
            let chunk = Helper.bufferToHex(rawChunk);
            let tx = await this.filestorage.contract.uploadChunk(address, filePath, ptrPosition, Helper.addBytesSymbol(chunk), privateKey);
            txs.push(tx);
            ptrPosition += chunk.length / 2;
            if (this.filestorage.enableLogs) {
                console.log('Chunk ' + i + ' was loaded ' + ptrPosition);
                ++i;
            }
        }

        if (this.filestorage.enableLogs) console.log('Checking file validity...');
        await this.filestorage.contract.finishUpload(address, filePath, privateKey);
        if (this.filestorage.enableLogs) console.log('File was uploaded!');
        return {contentPath: Helper.rmBytesSymbol(address).concat('/', filePath), txs: txs};
    }

    async deleteFile(address, filePath, privateKey) {
        return this.filestorage.deleteFile(address, filePath, privateKey);
    }

    async createDirectory(address, directoryPath, privateKey) {
        return this.filestorage.createDirectory(address, directoryPath, privateKey);
    }

    async deleteDirectory(address, directoryPath, privateKey) {
        return this.filestorage.deleteDirectory(address, directoryPath, privateKey);
    }

    async listDirectory(storagePath) {
        return this.filestorage.listDirectory(storagePath);
    }
}