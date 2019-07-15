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
 * @file index.test.js
 * @date 2019
 */
const assert = require('chai').assert;
const expect = require('chai').expect;
const FilestorageClient = require('../src/index');
const FilestorageContract = require('../src/FilestorageContract');
const helper = require('../src/common/helper');
let randomstring = require('randomstring');
let fs = require('fs');
const path = require('path');
const Web3 = require('web3');
require('dotenv').config();

describe('Test FilestorageClient', function () {
    let filestorage;
    let address;
    let privateKey;
    let foreignAddress;
    let foreignPrivateKey;
    let bigFilePath;
    const transactionErrorMessage = 'Transaction has been reverted by the EVM:';
    const callErrorMessage = 'Returned error: EVM revert instruction without description message';
    const keypairErrorMessage = 'Keypair mismatch';
    const invalidDownloadErrorMessage = 'Method downloadToFile can only be used with a browser';
    before(function () {
        // eslint-disable-next-line
        filestorage = new FilestorageClient(process.env.SKALE_ENDPOINT, true);
        address = process.env.ADDRESS;
        privateKey = process.env.PRIVATEKEY;
        foreignAddress = process.env.FOREIGN_ADDRESS;
        foreignPrivateKey = process.env.FOREIGN_PRIVATEKEY;
        bigFilePath = path.join(__dirname, process.env.TEST_FILE_PATH);
    });

    describe('Test contructor', function () {
        it('should initialize with web3', function () {
            const web3Provider = new Web3.providers.HttpProvider(process.env.SKALE_ENDPOINT);
            let web3 = new Web3(web3Provider);
            let filestorageClient = new FilestorageClient(web3);
            assert.instanceOf(filestorageClient, FilestorageClient);
            assert.instanceOf(filestorageClient.web3, Web3);
            assert.instanceOf(filestorageClient.contract, FilestorageContract);
        });

        it('should intitialize with http endpoint', function () {
            let filestorageClient = new FilestorageClient(process.env.SKALE_ENDPOINT);
            assert.instanceOf(filestorageClient, FilestorageClient);
            assert.instanceOf(filestorageClient.web3, Web3);
            assert.instanceOf(filestorageClient.contract, FilestorageContract);
        });

        it('should intitialize with enabled logs', function () {
            let filestorageClient = new FilestorageClient(process.env.SKALE_ENDPOINT, true);
            assert.isTrue(filestorageClient.enableLogs);
        });
    });

    describe('Test uploading', function () {

        let fileName;
        let data;
        describe('Positive tests', function () {
            beforeEach(function () {
                fileName = 'test_' + randomstring.generate();
                data = Buffer.from(fileName);
            });

            it('Uploading file with private key', async function () {
                let filepath = await filestorage.uploadFile(address, fileName, data, privateKey);
                assert.isTrue(filepath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            it('Uploading file with private key and address beginning with 0x', async function () {
                let filePath = await filestorage.uploadFile(helper.addBytesSymbol(address), fileName, data, privateKey);
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            it('Uploading file with private key without 0x', async function () {
                let filePath = await filestorage.uploadFile(address, fileName, data, helper.rmBytesSymbol(privateKey));
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            it('Uploading file with private key and address beginning with 0x', async function () {
                let filePath = await filestorage.uploadFile(helper.addBytesSymbol(address), fileName, data, privateKey);
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            it('Uploading file with private key without 0x and address beginning with 0x', async function () {
                let filePath = await filestorage.uploadFile(address, fileName, data, helper.rmBytesSymbol(privateKey));
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            it('Uploading file in directory', async function () {
                let directoryName = randomstring.generate();
                await filestorage.createDirectory(address, directoryName, privateKey);
                fileName = path.posix.join(directoryName, fileName);
                let filePath = await filestorage.uploadFile(address, fileName, data, privateKey);
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + fileName, 'Invalid storagePath');
            });

            afterEach('Checking file\'s existance', async function () {
                let fileList = await filestorage.getFileInfoListByAddress(address);
                let isFind = fileList.find(obj => {
                    return obj.name === fileName;
                });
                assert.isObject(isFind, 'File doesn\'t exist');
            });
        });

        describe('Negative tests', function () {
            let data;
            let fileName;
            beforeEach(function () {
                data = Buffer.from(randomstring.generate());
                fileName = randomstring.generate();
            });

            it('Uploading file with foreign privateKey', async function () {
                try {
                    await filestorage.uploadFile(address, fileName, data, foreignPrivateKey);
                    assert.fail('File was unexpectfully uploaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, keypairErrorMessage);
                }
            });

            it('Uploading file with size > 100mb', async function () {
                try {
                    let fileData = fs.readFileSync(bigFilePath);
                    await filestorage.uploadFile(address, fileName, fileData, privateKey);
                    assert.fail('File was unexpectfully uploaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });

            it('Uploading file with name > 256 chars', async function () {
                let fileName = randomstring.generate(256);
                try {
                    await filestorage.uploadFile(address, fileName, data, privateKey);
                    assert.fail('File was unexpectfully uploaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });

            it('Uploading file with existing name', async function () {
                await filestorage.uploadFile(address, fileName, data, privateKey);
                try {
                    await filestorage.uploadFile(address, fileName, data, privateKey);
                    assert.fail('File was unexpectfully uploaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });

            it('Uploading file with filename contained "/"', async function () {
                let fileName = '/hack';
                try {
                    await filestorage.uploadFile(address, fileName, data, privateKey);
                    assert.fail('File was unexpectfully uploaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });
        });
    });

    describe('Test downloading', function () {
        describe('Positive tests', function () {
            let fileName;
            let data;
            beforeEach(function () {
                fileName = 'test_' + randomstring.generate();
                data = Buffer.from(randomstring.generate());
            });

            it('Download own file', async function () {
                let storagePath = await filestorage.uploadFile(address, fileName, data, privateKey);
                let buffer = await filestorage.downloadToBuffer(storagePath);
                expect(buffer).to.be.instanceOf(Buffer);
                assert.deepEqual(buffer, data, 'File downloaded incorrectly');
            });

            it('Download foreign file', async function () {
                let storagePath = await filestorage.uploadFile(foreignAddress, fileName, data, foreignPrivateKey);
                let buffer = await filestorage.downloadToBuffer(storagePath);
                expect(buffer).to.be.instanceOf(Buffer);
                assert.deepEqual(buffer, data, 'File downloaded incorrectly');
            });

            it('Download file from directory', async function () {
                let directoryName = randomstring.generate();
                await filestorage.createDirectory(address, directoryName, privateKey);
                fileName = path.posix.join(directoryName, fileName);
                let storagePath = await filestorage.uploadFile(address, fileName, data, privateKey);
                let buffer = await filestorage.downloadToBuffer(storagePath);
                expect(buffer).to.be.instanceOf(Buffer);
                assert.deepEqual(buffer, data, 'File downloaded incorrectly');
            });
        });

        describe('Negative tests', function () {
            it('Download unexisted file', async function () {
                let storagePath = randomstring.generate();
                try {
                    await filestorage.downloadToBuffer(storagePath);

                    assert.fail('File was unexpectfully downloaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, callErrorMessage);
                }
            });

            it('Download using downloadToFile', async function () {
                let storagePath = randomstring.generate();
                try {
                    await filestorage.downloadToFile(storagePath);

                    assert.fail('File was unexpectfully downloaded');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, invalidDownloadErrorMessage);
                }
            });
            // TODO: Download unfinished file
        });
    });

    describe('Test deleting', function () {
        describe('Positive tests', function () {
            let fileName;
            beforeEach(async function () {
                fileName = 'delete_' + randomstring.generate();
                let data = Buffer.from(randomstring.generate());
                await filestorage.uploadFile(address, fileName, data, privateKey);
            });

            afterEach(async function () {
                let fileList = await filestorage.getFileInfoListByAddress(address);
                let isFind = fileList.find(obj => {
                    return obj.name === fileName;
                });
                assert.isUndefined(isFind, 'File not deleted');
            });

            it('should delete existing own file', async function () {
                await filestorage.deleteFile(address, fileName, privateKey);
            });

            it('should delete file from directory', async function () {
                let directoryName = randomstring.generate();
                await filestorage.createDirectory(address, directoryName, privateKey);
                fileName = path.posix.join(directoryName, fileName);
                let data = Buffer.from(randomstring.generate());
                await filestorage.uploadFile(address, fileName, data, privateKey);
                await filestorage.deleteFile(address, fileName, privateKey);
            });

            // TODO: Delete unfinished file
        });

        describe('Negative tests', function () {
            it('should delete unexisting own file', async function () {
                let fileName = 'delete_' + randomstring.generate();
                try {
                    await filestorage.deleteFile(address, fileName, privateKey);
                    assert.fail('File was unexpectfully deleted');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });

            it('should delete foreign file', async function () {
                let fileName = 'delete_' + randomstring.generate();
                let data = Buffer.from(randomstring.generate());
                await filestorage.uploadFile(foreignAddress, fileName, data, foreignPrivateKey);
                try {
                    await filestorage.deleteFile(address, fileName, privateKey);
                    assert.fail('File was unexpectfully deleted');
                } catch (error) {
                    assert.throws(() => {
                        throw new Error(error.message);
                    }, transactionErrorMessage);
                }
            });
        });
    });

    describe('Test getFileInfoListByAddress', function () {
        function isValidStoragePath(storagePath) {
            let re = new RegExp('([0-9]|[a-f]|[A-F]){40}\\/.+');
            return re.test(storagePath);
        }

        describe('Positive tests', function () {
            it('should return fileInfo list', async function () {
                let fileInfoArray = await filestorage.getFileInfoListByAddress(address);
                assert.isNotEmpty(fileInfoArray, 'Array is empty');
                assert.isArray(fileInfoArray, 'Object is not array');
                let fileInfoObject = fileInfoArray[fileInfoArray.length - 1];
                assert.isString(fileInfoObject['name'], 'fileInfo.name is not String');
                assert.isNumber(fileInfoObject['size'], 'fileInfo.size is not Number');
                assert.isString(fileInfoObject['storagePath'], 'fileInfo.storagePath is not String');
                assert.isTrue(isValidStoragePath(fileInfoObject['storagePath']), 'fileInfo.storagePath is not valid');
                assert.isNumber(fileInfoObject['uploadingProgress'], 'fileInfo.uploadedChunks is not Number');
                assert.isTrue(fileInfoObject['uploadingProgress'] >= 0);
                assert.isTrue(fileInfoObject['uploadingProgress'] <= 100);
            });
        });
    });

    describe('Test createDirectory', function () {
        describe('Positive tests', function () {
            it('should create directory', async function () {
                let directoryName = randomstring.generate();
                await filestorage.createDirectory(address, directoryName, privateKey);
                let contents = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                assert.isNotEmpty(contents);
                assert.isTrue(contents.indexOf(directoryName) > -1);
            });
        });
    });

    describe('Test listDirectory', function () {
        describe('Positive tests', function () {
            let fileName;
            let directoryName;
            before(async function () {
                directoryName = randomstring.generate();
                fileName = randomstring.generate();
                let data = Buffer.from(fileName);
                await filestorage.createDirectory(address, directoryName, privateKey);
                await filestorage.uploadFile(address, fileName, data, privateKey);
                let filePath = path.posix.join(directoryName, fileName);
                await filestorage.uploadFile(address, filePath, data, privateKey);
            });

            it('should list root directory', async function () {
                let contents = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                assert.isArray(contents);
                assert.isNotEmpty(contents);
                assert.isTrue(contents.indexOf(directoryName) > -1, 'Directory is absent');
                assert.isTrue(contents.indexOf(fileName) > -1, 'File is absent');
            });

            it('should list nested directory', async function () {
                let directoryPath = path.posix.join(helper.rmBytesSymbol(address), directoryName);
                let contents = await filestorage.listDirectory(directoryPath);
                assert.isArray(contents);
                assert.isNotEmpty(contents);
                assert.isTrue(contents.indexOf(fileName) > -1);
            });
        });
    });

    describe('test deleteDirectory', function () {
        describe('Positive tests', function () {
            let directoryName;
            beforeEach(async function () {
                directoryName = randomstring.generate();
                await filestorage.createDirectory(address, directoryName, privateKey);
            });

            it('should delete empty directory', async function () {
                await filestorage.deleteDirectory(address, directoryName, privateKey);
                let contents = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                assert.isNotEmpty(contents);
                assert.isTrue(contents.indexOf(directoryName) === -1);
            });
        });
    });
});
