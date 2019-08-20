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
const FilestorageClient = require('../src/index');
const FilestorageContract = require('../src/FilestorageContract');
const helper = require('../src/common/helper');
const errorMessages = require('./utils/constants').errorMessages;
const fileStatus = require('./utils/constants').fileStatus;
const constants = require('../src/common/constants');
const path = require('path');
const Web3 = require('web3');
const randomstring = require('randomstring');
const fs = require('fs');
require('dotenv').config();

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-as-promised'));

describe('Test FilestorageClient', function () {
    let filestorage;
    let address;
    let privateKey;
    let foreignAddress;
    let foreignPrivateKey;
    let emptyAddress;
    let bigFilePath;
    before(function () {
        // eslint-disable-next-line
        filestorage = new FilestorageClient(process.env.SKALE_ENDPOINT, true);
        address = process.env.ADDRESS;
        privateKey = process.env.PRIVATEKEY;
        foreignAddress = process.env.FOREIGN_ADDRESS;
        foreignPrivateKey = process.env.FOREIGN_PRIVATEKEY;
        emptyAddress = process.env.EMPTY_ADDRESS;
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

    // TODO: test big files uploading
    describe('Test uploading', function () {

        let fileName;
        let dirPath;
        let data;
        describe('Positive tests', function () {
            beforeEach(function () {
                fileName = 'test_' + randomstring.generate();
                data = Buffer.from(fileName);
                dirPath = helper.rmBytesSymbol(address) + '/';
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
                let relativePath = path.posix.join(directoryName, fileName);
                dirPath = path.posix.join(dirPath, directoryName);
                let filePath = await filestorage.uploadFile(address, relativePath, data, privateKey);
                assert.isTrue(filePath === helper.rmBytesSymbol(address) + '/' + relativePath, 'Invalid storagePath');
            });

            afterEach('Checking file\'s existance', async function () {
                let fileList = await filestorage.listDirectory(dirPath);
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
                await filestorage.uploadFile(address, fileName, data, foreignPrivateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INVALID_KEYPAIR);
            });

            it('Uploading file with size > 100mb', async function () {
                let fileData = fs.readFileSync(bigFilePath);
                await filestorage.uploadFile(address, fileName, fileData, privateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INCORRECT_FILESIZE);
            });

            it('Uploading file with name > 255 chars', async function () {
                let fileName = randomstring.generate(256);
                await filestorage.uploadFile(address, fileName, data, privateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INCORRECT_FILENAME);
            });

            it('Uploading file with existing name', async function () {
                await filestorage.uploadFile(address, fileName, data, privateKey);
                await filestorage.uploadFile(address, fileName, data, privateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.FILE_ALREADY_EXISTS);
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
                await filestorage.downloadToBuffer(storagePath)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INVALID_STORAGEPATH);
            });

            it('Download using downloadToFile', async function () {
                let storagePath = randomstring.generate();
                await filestorage.downloadToFile(storagePath)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.ONLY_BROWSER_METHOD);
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
                let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
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
                await filestorage.deleteFile(address, fileName, privateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INVALID_PATH);
            });

            it('should delete foreign file', async function () {
                let fileName = 'delete_' + randomstring.generate();
                let data = Buffer.from(randomstring.generate());
                await filestorage.uploadFile(foreignAddress, fileName, data, foreignPrivateKey);
                await filestorage.deleteFile(address, fileName, privateKey)
                    .should
                    .eventually
                    .rejectedWith(errorMessages.INVALID_PATH);
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
                assert.isObject(contents.find(obj => {
                    return obj.name === directoryName;
                }));
            });
        });
    });

    describe('Test listDirectory', function () {
        describe('Positive tests', function () {
            let fileName;
            let directoryName;
            function isValidStoragePath(storagePath) {
                let re = new RegExp('([0-9]|[a-f]|[A-F]){40}\\/.+');
                return re.test(storagePath);
            }

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
                let contentList = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                assert.isArray(contentList);
                assert.isNotEmpty(contentList);
                assert.isObject(contentList.find(obj => {
                    return obj.name === directoryName;
                }), 'Directory is absent');
                assert.isObject(contentList.find(obj => {
                    return obj.name === fileName;
                }), 'File is absent');
            });

            it('should list root directory without /', async function () {
                let contentList = await filestorage.listDirectory(helper.rmBytesSymbol(address));
                assert.isArray(contentList);
                assert.isNotEmpty(contentList);
                assert.isObject(contentList.find(obj => {
                    return obj.name === directoryName;
                }), 'Directory is absent');
                assert.isObject(contentList.find(obj => {
                    return obj.name === fileName;
                }), 'File is absent');
            });

            it('should list nested directory', async function () {
                let directoryPath = path.posix.join(helper.rmBytesSymbol(address), directoryName);
                let contentList = await filestorage.listDirectory(directoryPath);
                assert.isArray(contentList);
                assert.isNotEmpty(contentList);
                assert.isObject(contentList.find(obj => {
                    return obj.name === fileName;
                }));
            });

            it('should return file info in specific format', async function () {
                let fileName = randomstring.generate();
                let data = Buffer.from(randomstring.generate({
                    length: 2 * constants.CHUNK_LENGTH,
                    charset: 'hex'
                }), 'hex');
                await filestorage.uploadFile(address, fileName, data, privateKey);
                let content = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                let fileInfo = content.find(obj => {
                    return obj.name === fileName;
                });
                assert.isObject(fileInfo);
                assert.lengthOf(Object.keys(fileInfo), 6, 'Incorrect length of fileInfo');
                assert.isTrue(fileInfo.name === fileName, 'Incorrect fileName');
                assert.isTrue(isValidStoragePath(fileInfo.storagePath), 'Invalid storagePath');
                assert.isTrue(fileInfo.storagePath === path.posix.join(helper.rmBytesSymbol(address), fileName),
                    'Invalid storagePath');
                assert.isTrue(fileInfo.isFile, 'Incorrect isFile');
                assert.isTrue(fileInfo.size === constants.CHUNK_LENGTH, 'Incorrect fileSize');
                assert.isTrue(fileInfo.status === fileStatus.STATUS_COMPLETED, 'Finished file: incorrect status');
                assert.isTrue(fileInfo.uploadingProgress === 100, 'Finished file: incorrect chunks');
            });

            it('should return dir info in specific format', async function () {
                let dirName = randomstring.generate();
                let dirPath = path.posix.join(helper.rmBytesSymbol(address), dirName);
                await filestorage.createDirectory(address, dirName, privateKey);
                let content = await filestorage.listDirectory(helper.rmBytesSymbol(address) + '/');
                let dirInfo = content.find(obj => {
                    return obj.name === dirName;
                });
                assert.isObject(dirInfo);
                assert.lengthOf(Object.keys(dirInfo), 3, 'Incorrect length of dirInfo');
                assert.equal(dirInfo.name, dirName, 'Incorrect dirName');
                assert.isTrue(isValidStoragePath(dirInfo.storagePath), 'Invalid storagePath of dir');
                assert.equal(dirInfo.storagePath, dirPath, 'Incorrect dir storagePath');
                assert.isFalse(dirInfo.isFile, 'Incorrect isFile');
            });

            it('should return empty array wheteher user has no files', async function () {
                let files = await filestorage.listDirectory(helper.rmBytesSymbol(emptyAddress) + '/');
                assert.isArray(files, 'should return array');
                assert.isEmpty(files, 'should contain files');
            });

            it('should fail listing unexisted dir', async function () {
                await filestorage.listDirectory(path.posix.join(helper.rmBytesSymbol(emptyAddress), 'void'))
                    .should.eventually.rejectedWith(errorMessages.INVALID_PATH);
                await filestorage.listDirectory('')
                    .should.eventually.rejectedWith(errorMessages.INVALID_STORAGEPATH);
                await filestorage.listDirectory(' ')
                    .should.eventually.rejectedWith(errorMessages.INVALID_STORAGEPATH);
                await filestorage.listDirectory(helper.addBytesSymbol(address))
                    .should.eventually.rejectedWith(errorMessages.INVALID_STORAGEPATH);
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
