/**
 * @license
 * SKALE Filestorage-js
 * Copyright (C) 2019-Present SKALE Labs
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
 * @file chrome.test.js
 * @date 2019
 */
let webdriver = require('selenium-webdriver');
let Options = require('selenium-webdriver/chrome').Options;
let path = require('path');
let Web3 = require('web3');
let fs = require('fs');
let Filestorage = require('../../src/index');
let constants = require('../utils/constants');
let helper = require('../../src/common/helper');
let testHelper = require('../utils/helper');
let server = require('../utils/testServer');
let Metamask = require('../utils/MetamaskStub');
const randomstring = require('randomstring');
require('dotenv').config();

// eslint-disable-next-line
let chrome = require('chromedriver');

const chai = require('chai');
const assert = chai.assert;
chai.should();
chai.use(require('chai-as-promised'));

const encodeExt = file => {
    const stream = fs.readFileSync(path.resolve(file));
    return Buffer.from(stream).toString('base64');
};
describe('Chrome integration', async function () {
    let htmlPage;
    let downloadDir;
    let filestorage;
    let fileName;
    let data;
    let address;
    let chromeCapabilities;
    let endpoint = process.env.SKALE_ENDPOINT;
    const smallTimeOut = constants.SHORT_TIMEOUT;
    const bigTimeOut = constants.LARGE_TIMEOUT;
    before(async function () {
        server.run();
        downloadDir = path.join(__dirname, 'testFiles');
        htmlPage = constants.TEST_SERVER_ADDRESS;
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }
        chromeCapabilities = webdriver.Capabilities.chrome();
        let chromeOptions = {
            'args': ['--test-type', '--start-maximized', '--no-sandbox']
        };
        chromeCapabilities.set('chromeOptions', chromeOptions);
        filestorage = new Filestorage(endpoint);
        address = await testHelper.getAddress(process.env.PRIVATEKEY);
        await testHelper.getFunds(address);
        await testHelper.reserveTestSpace(filestorage.contract.contract, address, constants.RESERVED_SPACE);
        fileName = randomstring.generate();
        data = Buffer.from(fileName);
    });

    describe('downloadToFile', async function () {
        let storagePath;
        let pathToFile;
        let driver;
        before(async function () {
            driver = new webdriver.Builder()
                .withCapabilities(chromeCapabilities)
                .build();
            await driver.setDownloadPath(downloadDir);
            pathToFile = path.join(downloadDir, fileName);
            storagePath = await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
            driver.get(htmlPage);
        });

        it('should download file from fs to local', async function () {
            await driver.findElement(webdriver.By.id('SCHAIN_ENDPOINT')).sendKeys(endpoint);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(storagePath);
            await driver.findElement(webdriver.By.id('downloadFile')).click();
            await driver.wait(webdriver.until.titleIs('Downloaded'), bigTimeOut);
            await driver.sleep(smallTimeOut);
            assert.isTrue(fs.existsSync(pathToFile), 'File is not downloaded');
            assert.isTrue(Buffer.compare(fs.readFileSync(pathToFile), data) === 0, 'File content is differ');
        });

        after(async function () {
            driver.quit();
            await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
            fs.unlinkSync(pathToFile);
        });
    });

    describe('metamask', async function () {
        let directoryName;
        let driver;
        let metamask;
        before(async function () {
            driver = new webdriver.Builder()
                .withCapabilities(chromeCapabilities)
                .setChromeOptions(new Options()
                    .addExtensions(encodeExt(path.join(__dirname, 'metamask.crx'))))
                .build();
            metamask = new Metamask(constants.METAMASK_ID);
            let web3 = new Web3(endpoint);
            let chainId = await web3.eth.getChainId();
            await metamask.initialize(driver, process.env.METAMASK_PASSWORD, process.env.SEED_PHRASE);
            await metamask.addEndpoint(driver, endpoint, chainId);
            await metamask.addAccount(driver, process.env.PRIVATEKEY);
        });

        it('should delete with metamask', async function () {
            await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
            driver.get(htmlPage);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(fileName);
            await driver.findElement(webdriver.By.id('deleteFile')).click();
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Deleted'), bigTimeOut);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            assert.isUndefined(isFind);
        });

        it('should upload with metamask', async function () {
            driver.get(htmlPage);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(fileName);
            await driver.findElement(webdriver.By.id('uploadFile')).click();
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Uploaded'), bigTimeOut);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            assert.isObject(isFind);
            assert.isTrue(isFind.uploadingProgress === 100);
        });

        it('should create directory with metamask', async function () {
            directoryName = 'testDirectory';
            driver.get(htmlPage);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(directoryName);
            await driver.findElement(webdriver.By.id('createDirectory')).click();
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Directory created'), bigTimeOut);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === directoryName;
            });
            assert.isObject(isFind);
            assert.isFalse(isFind.isFile);
        });

        it('should delete directory with metamask', async function () {
            directoryName = 'testDirectory';
            await filestorage.createDirectory(address, directoryName, process.env.PRIVATEKEY);
            driver.get(htmlPage);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(directoryName);
            await driver.findElement(webdriver.By.id('deleteDirectory')).click();
            await driver.sleep(smallTimeOut);
            await metamask.confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Directory deleted'), bigTimeOut);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === directoryName;
            });
            assert.isUndefined(isFind);
        });

        afterEach(async function () {
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            if (isFind) await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
            isFind = fileList.find(obj => {
                return obj.name === directoryName;
            });
            if (isFind) await filestorage.deleteDirectory(address, directoryName, process.env.PRIVATEKEY);
        });

        after(async function () {
            await driver.quit();
        });
    });

    after(async function () {
        fs.rmdirSync(downloadDir);
        server.stop();
    });
});
