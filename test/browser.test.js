let webdriver = require('selenium-webdriver');
let Filestorage = require('../src/index');
let fs = require('fs');
let path = require('path');
require('dotenv').config();

const chromeOption = require('selenium-webdriver/chrome');
let chrome = require('chromedriver');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(require('chai-as-promised'));

describe('Browser integration', async function () {
    let htmlPage;
    let driver;
    let downloadDir;

    before(async function () {
        downloadDir = path.join(__dirname, 'downloadedFiles');
        htmlPage = path.join("file:///", __dirname, "test.html");
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        let chromeCapabilities = webdriver.Capabilities.chrome();
        let chromeOptions = {
            'args': ['--test-type', '--start-maximized'],
            'prefs': {"download.default_directory": downloadDir}
        };
        chromeCapabilities.set('chromeOptions', chromeOptions);
        driver = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .build();
    });

    describe('downloadToFile', async function () {
        let fileName = 'testFile';
        let endpoint = process.env.SKALE_ENDPOINT;
        let address = process.env.ADDRESS;
        let data = Buffer.from(fileName);
        let storagePath;
        let filestorage;

        before(async function () {
            filestorage = new Filestorage(endpoint, true);
            storagePath = await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
            driver.get(htmlPage);
        });

        it('should download file from fs to local', async function () {
            await driver.findElement(webdriver.By.id('SCHAIN_ENDPOINT')).sendKeys(endpoint);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(storagePath);
            await driver.findElement(webdriver.By.id('downloadFile')).click();
            await driver.wait(webdriver.until.titleIs('Downloaded'), 100000);
            await driver.sleep(2000);
        });

        after(async function () {
            await driver.quit();
            await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
            fs.unlinkSync(path.join(downloadDir, fileName));
        });
    });

    after(async function() {
        fs.rmdirSync(downloadDir);
    })
});
