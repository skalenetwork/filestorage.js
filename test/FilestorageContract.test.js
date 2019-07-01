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
 * @file FilestorageContract.test.js
 * @date 2019
 */
const assert = require('chai').assert;
const randomstring = require('randomstring');
const FilestorageContract = require('../src/FilestorageContract');
const helper = require('../src/common/helper');
const constants = require('../src/common/constants');
const Web3 = require('web3');
const path = require('path');
require('dotenv').config();

const STATUS_UNEXISTENT = 0;
const STATUS_UPLOADING = 1;
const STATUS_COMPLETED = 2;
describe('FilestorageContract', function () {
    let filestorageContract;
    let address;
    let privateKey;
    let emptyAddress;
    const smallChunkLength = 2 ** 10;
    before(function () {
        const web3Provider = new Web3.providers.HttpProvider(process.env.SKALE_ENDPOINT);
        let web3 = new Web3(web3Provider);
        filestorageContract = new FilestorageContract(web3);
        address = process.env.ADDRESS;
        privateKey = process.env.PRIVATEKEY;
        emptyAddress = process.env.EMPTY_ADDRESS;
    });

    describe('Test contructor', function () {
        it('should initialize with web3', function () {
            const web3Provider = new Web3.providers.HttpProvider(process.env.SKALE_ENDPOINT);
            let web3 = new Web3(web3Provider);
            let filestorageContractInstance = new FilestorageContract(web3);
            assert.instanceOf(filestorageContractInstance, FilestorageContract);
            assert.instanceOf(filestorageContractInstance.web3, Web3);
            assert.instanceOf(filestorageContractInstance.contract, web3.eth.Contract);
        });
    });

    describe('Test startUpload', function () {
        describe('Positive tests', function () {
            let fileName;
            beforeEach(function () {
                fileName = randomstring.generate();
            });

            it('should create file', async function () {
                await filestorageContract.startUpload(address, fileName, Math.floor(Math.random() * 100), privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.isOk(status, 'File doesn\'t exist');
            });

            it('should create empty file', async function () {
                await filestorageContract.startUpload(address, fileName, 0, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.isOk(status, 'File doesn\'t exist');
            });
        });

        // TODO: Negative tests
    });

    describe('Test uploadChunk', function () {
        async function checkChunk(fileName, chunkNumber) {
            let fileList = await filestorageContract.getFileInfoList(address);
            let fileInfo = fileList.find(obj => {
                return obj.name === fileName;
            });
            return fileInfo.isChunkUploaded[chunkNumber];
        }

        describe('Positive tests', function () {
            let fileName;
            let fileSize;
            before(async function () {
                fileName = randomstring.generate();
                fileSize = constants.CHUNK_LENGTH + smallChunkLength;
                await filestorageContract.startUpload(address, fileName, fileSize, privateKey);
            });

            it('should upload 1Mb chunk', async function () {
                let chunkData = helper.addBytesSymbol(randomstring.generate({
                    length: constants.CHUNK_LENGTH,
                    charset: 'hex'
                }));
                await filestorageContract.uploadChunk(address, fileName, 0, chunkData, privateKey);
                let status = await checkChunk(fileName, 0);
                assert.isOk(status, 'Chunk is not uploaded');
            });

            it('should upload chunk less than 1Mb', async function () {
                let chunkData = helper.addBytesSymbol(
                    randomstring.generate({
                        length: smallChunkLength,
                        charset: 'hex'
                    })
                );
                await filestorageContract.uploadChunk(address, fileName, constants.CHUNK_LENGTH, chunkData, privateKey);
                let status = checkChunk(fileName, 1);
                assert.isOk(status, 'Chunk is not uploaded');
            });
        });

        // TODO: Negative tests
    });

    describe('Test finishUpload', function () {
        describe('Positive tests', function () {
            it('should finish uploading in empty file', async function () {
                let fileName = randomstring.generate();
                await filestorageContract.startUpload(address, fileName, 0, privateKey);
                await filestorageContract.finishUpload(address, fileName, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.equal(status, STATUS_COMPLETED, 'Uploading is not finished');
            });

            it('should finish uploading in several-chunk file', async function () {
                let fileName = randomstring.generate();
                await filestorageContract.startUpload(address, fileName, 2 * (constants.CHUNK_LENGTH), privateKey);
                for (let i = 0; i < 2; ++i) {
                    let chunkData = helper.addBytesSymbol(randomstring.generate({
                        length: constants.CHUNK_LENGTH,
                        charset: 'hex'
                    }));
                    await filestorageContract.uploadChunk(
                        address,
                        fileName,
                        i * (constants.CHUNK_LENGTH),
                        chunkData,
                        privateKey
                    );
                }
                await filestorageContract.finishUpload(address, fileName, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.equal(status, STATUS_COMPLETED, 'Uploading is not finished');
            });
        });

        // TODO: Negative tests
    });

    describe('Test deleteFile', function () {
        describe('Positive tests', function () {
            let fileName;
            beforeEach(async function () {
                fileName = randomstring.generate();
                await filestorageContract.startUpload(address, fileName, 2 * (constants.CHUNK_LENGTH), privateKey);
            });

            it('should delete finished file', async function () {
                for (let i = 0; i < 2; ++i) {
                    let chunkData = helper.addBytesSymbol(randomstring.generate({
                        length: constants.CHUNK_LENGTH,
                        charset: 'hex'
                    }));
                    await filestorageContract.uploadChunk(
                        address,
                        fileName,
                        i * (constants.CHUNK_LENGTH),
                        chunkData,
                        privateKey
                    );
                }
                await filestorageContract.finishUpload(address, fileName, privateKey);
                await filestorageContract.deleteFile(address, fileName, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.equal(status, STATUS_UNEXISTENT, 'File is not deleted');
            });

            it('should delete unfinished file', async function () {
                let chunkData = helper.addBytesSymbol(randomstring.generate({
                    length: constants.CHUNK_LENGTH,
                    charset: 'hex'
                }));
                await filestorageContract.uploadChunk(address, fileName, constants.CHUNK_LENGTH, chunkData, privateKey);
                await filestorageContract.deleteFile(address, fileName, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.equal(status, STATUS_UNEXISTENT, 'File is not deleted');
            });

            it('should delete file without uploading chunks', async function () {
                await filestorageContract.deleteFile(address, fileName, privateKey);
                let filePath = path.join(helper.rmBytesSymbol(address), fileName);
                let status = await filestorageContract.getFileStatus(filePath);
                assert.equal(status, STATUS_UNEXISTENT, 'File is not deleted');
            });
        });

        // TODO: Negative tests
    });

    describe('Test readChunk', function () {
        describe('Positive tests', function () {
            let storagePath;
            let uploadedData = '';
            let chunkLength = constants.CHUNK_LENGTH;
            let position;
            before(async function () {
                let fileName = randomstring.generate();
                await filestorageContract.startUpload(address, fileName, 2 * chunkLength, privateKey);
                for (let i = 0; i < 2; ++i) {
                    let data = randomstring.generate({length: 2 * chunkLength, charset: 'hex'});
                    let chunkData = helper.addBytesSymbol(data);
                    uploadedData = uploadedData + data;
                    await filestorageContract.uploadChunk(address, fileName, i * chunkLength, chunkData, privateKey);
                }
                await filestorageContract.finishUpload(address, fileName, privateKey);
                storagePath = path.join(helper.rmBytesSymbol(address), fileName);
                position = Math.floor(Math.random() * chunkLength);
            });

            it('should read less than 1Mb chunk', async function () {
                let data = await filestorageContract.readChunk(storagePath, 0, smallChunkLength);
                assert.isArray(data);
                let parsedData = helper.concatBytes32Array(data, 2 * smallChunkLength);
                assert.equal(parsedData, uploadedData.substr(0, 2 * smallChunkLength));
            });

            it('should read 1Mb chunk', async function () {
                let data = await filestorageContract.readChunk(storagePath, 0, chunkLength);
                assert.isArray(data);
                let parsedData = helper.concatBytes32Array(data, 2 * chunkLength);
                assert.equal(parsedData, uploadedData.substr(0, 2 * chunkLength));
            });

            it('should read less than 1Mb chunk from specific position', async function () {
                let data = await filestorageContract.readChunk(storagePath, position, smallChunkLength);
                assert.isArray(data);
                let parsedData = helper.concatBytes32Array(data, 2 * smallChunkLength);
                assert.equal(parsedData, uploadedData.substr(2 * position, 2 * smallChunkLength));
            });

            it('should read 1Mb chunk from specific position', async function () {
                let data = await filestorageContract.readChunk(storagePath, position, chunkLength);
                assert.isArray(data);
                let parsedData = helper.concatBytes32Array(data, 2 * chunkLength);
                assert.equal(parsedData, uploadedData.substr(2 * position, 2 * chunkLength));
            });
        });

        // TODO: Negative tests
    });

    describe('Test getFileStatus', function () {
        describe('Positive tests', function () {
            let emptyFileStoragePath;
            let loadingFileStoragePath;
            let completedFileStoragePath;
            before(async function () {
                let emptyFileName = randomstring.generate();
                emptyFileStoragePath = path.join(helper.rmBytesSymbol(address), emptyFileName);
                let loadingFileName = randomstring.generate();
                await filestorageContract.startUpload(address, loadingFileName, 0, privateKey);
                loadingFileStoragePath = path.join(helper.rmBytesSymbol(address), loadingFileName);
                let completedFileName = randomstring.generate();
                await filestorageContract.startUpload(address, completedFileName, 0, privateKey);
                await filestorageContract.finishUpload(address, completedFileName, privateKey);
                completedFileStoragePath = path.join(helper.rmBytesSymbol(address), completedFileName);
            });

            it('should return 0 when file is not existed', async function () {
                let status = await filestorageContract.getFileStatus(emptyFileStoragePath);
                assert.equal(status, STATUS_UNEXISTENT);
            });

            it('should return 1 when file is loading', async function () {
                let status = await filestorageContract.getFileStatus(loadingFileStoragePath);
                assert.equal(status, STATUS_UPLOADING);
            });

            it('should return 2 when file is completed', async function () {
                let status = await filestorageContract.getFileStatus(completedFileStoragePath);
                assert.equal(status, STATUS_COMPLETED);
            });
        });

        // TODO: Negative tests
    });

    describe('Test getFileSize', function () {
        describe('Positive tests', function () {
            let fileSize;
            let storagePath;
            before(async function () {
                let fileName = randomstring.generate();
                fileSize = Math.floor(Math.random() * constants.CHUNK_LENGTH * 16);
                await filestorageContract.startUpload(address, fileName, fileSize, privateKey);
                storagePath = path.join(helper.rmBytesSymbol(address), fileName);
            });

            it('should return correct fileSize of the files', async function () {
                let size = await filestorageContract.getFileSize(storagePath);
                assert.equal(size, fileSize);
            });
        });

        // TODO: Negative tests
    });

    describe('Test getFileInfoList', function () {
        describe('Positive tests', function () {
            it('should return fileInfo\'s list whether user has files', async function () {
                let files = await filestorageContract.getFileInfoList(address);
                assert.isArray(files, 'should return array');
                assert.isNotEmpty(files, 'should contain files');
            });

            it('should return empty array wheteher user has no files', async function () {
                let files = await filestorageContract.getFileInfoList(emptyAddress);
                assert.isArray(files, 'should return array');
                assert.isEmpty(files, 'should contain files');
            });
        });
    });

    describe('Test createDirectory', function () {
        describe('Positive tests', function () {
            it('should create new directory', async function () {
                let directoryName = randomstring.generate();
                await filestorageContract.createDirectory(address, directoryName, privateKey);
                let dirs = await filestorageContract.listDirectory(address+"/");
                assert.isNotEmpty(dirs);
                assert.isTrue(dirs.indexOf(directoryName) > -1);
            });
        })
    });

    describe('Test listDirectory', function () {
        describe('Positive tests', function () {
            it('should list content in root dir', async function () {
                let contents = await filestorageContract.listDirectory(address+"/");
                assert.isNotEmpty(contents);
                assert.isArray(contents);
            });

            it('should list content in nested dir', async function () {
                let directoryName = randomstring.generate();
                await filestorageContract.createDirectory(address, directoryName, privateKey);
                let contents = await filestorageContract.listDirectory(path.join(address, directoryName));
                assert.isNotEmpty(contents);
                assert.isArray(contents);
            });
        })
    })
});
