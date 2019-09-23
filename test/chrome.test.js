let webdriver = require('selenium-webdriver');
let Options = require('selenium-webdriver/chrome').Options;
let Filestorage = require('../src/index');
let fs = require('fs');
let path = require('path');
let helper = require('../src/common/helper');
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
    let driver;
    let downloadDir;
    let endpoint = process.env.SKALE_ENDPOINT;
    let address = process.env.ADDRESS;

    before(async function () {
        downloadDir = path.join(__dirname, 'testFiles');
        htmlPage = 'http://localhost:4000';
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }
        let chromeCapabilities = webdriver.Capabilities.chrome();
        let chromeOptions = {
            'args': ['--test-type', '--start-maximized', '--no-sandbox']
        };
        chromeCapabilities.set('chromeOptions', chromeOptions);
        driver = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .setChromeOptions(new Options()
                .addExtensions(encodeExt(path.join(__dirname, "metamask.crx"))))
            .build();
        await driver.setDownloadPath(downloadDir);
    });

    describe('downloadToFile', async function () {
        let fileName = 'testFile';
        let data = Buffer.from(fileName);
        let storagePath;
        let filestorage;
        let pathToFile;
        before(async function () {
            pathToFile = path.join(downloadDir, fileName);
            filestorage = new Filestorage(endpoint);
            storagePath = await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
            driver.get(htmlPage);
        });

        it('should download file from fs to local', async function () {
            await driver.findElement(webdriver.By.id('SCHAIN_ENDPOINT')).sendKeys(endpoint);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(storagePath);
            await driver.findElement(webdriver.By.id('downloadFile')).click();
            await driver.wait(webdriver.until.titleIs('Downloaded'), 100000);
            await driver.sleep(2000);
            assert.isTrue(fs.existsSync(pathToFile), 'File is not downloaded');
            assert.isTrue(Buffer.compare(fs.readFileSync(pathToFile), data) === 0, 'File content is differ');
        });

        after(async function () {
            await driver.quit();
            await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
            fs.unlinkSync(pathToFile);
        });
    });

    describe('metamask', async function () {
        let fileName;

        async function initMetamask(driver, metamaskId, password, seedPhrase) {
            await driver.get("chrome-extension://" + metamaskId + "/home.html");
            await driver.sleep(2000);
            await driver.findElement(webdriver.By.xpath("//*[contains(text(), 'Continue')]")).click();
            await driver.sleep(2000);
            await driver.findElement(webdriver.By.xpath("//*[contains(text(), 'Import with seed phrase')]")).click();
            await driver.findElement(webdriver.By.id('password')).sendKeys(password);
            await driver.findElement(webdriver.By.id('confirm-password')).sendKeys(password);
            await driver.findElement(webdriver.By.xpath(
                "//textarea[@placeholder='Separate each word with a single space']"
            )).sendKeys(seedPhrase);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Import')]")).click();
            await driver.sleep(3000);
            await driver.executeScript("document.querySelector('div.first-time-flow__markdown').scrollTop =" +
                "document.querySelector('div.first-time-flow__markdown').scrollHeight");
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Accept')]")).click();
            await driver.sleep(1000);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Accept')]")).click();
            await driver.sleep(1000);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Accept')]")).click();
            await driver.sleep(1000);
        }

        async function addEndpoint(driver, endpoint) {
            await driver.findElement(webdriver.By.xpath("//div[@class='app-header__network-component-wrapper']")).click();
            await driver.findElement(webdriver.By.xpath("//li[contains(., 'Custom RPC')]")).click();
            await driver.findElement(webdriver.By.id('new-rpc')).sendKeys(endpoint);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Save')]")).click();
            await driver.sleep(2000);
        }

        async function addAccount(driver, privateKey) {
            await driver.findElement(webdriver.By.xpath("//div[@class='identicon']")).click();
            await driver.findElement(webdriver.By.xpath("//div[contains(text(), 'Import Account')]")).click();
            await driver.findElement(webdriver.By.id('private-key-box')).sendKeys(privateKey);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Import')]")).click();
            await driver.sleep(2000);
        }

        async function confirmTransaction(driver) {
            let currentWindow = await driver.getWindowHandle();
            let windows = await driver.getAllWindowHandles();
            await driver.switchTo().window(windows[windows.length - 1]);
            await driver.sleep(3000);
            await driver.findElement(webdriver.By.xpath("//button[contains(text(), 'Confirm')]")).click();
            await driver.switchTo().window(currentWindow);
        }

        before(async function () {
            let id = 'ikhmppmeodmilchppjpiigoaonkpdocc';
            await initMetamask(driver, id, process.env.METAMASK_PASSWORD, process.env.SEED_PHRASE);
            await addEndpoint(driver, process.env.SKALE_ENDPOINT);
            await addAccount(driver, process.env.PRIVATEKEY);
            await driver.sleep(1000);
        });

        it('should delete with metamask', async function () {
            fileName = 'testFile';
            let data = Buffer.from(fileName);
            let filestorage = new Filestorage(endpoint);
            await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
            driver.get(htmlPage);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(fileName);
            await driver.findElement(webdriver.By.id('deleteFile')).click();
            await driver.sleep(3000);
            confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Deleted'), 100000);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            assert.isUndefined(isFind);
        });

        it('should upload with metamask', async function () {
            fileName = 'testFile';
            driver.get(htmlPage);
            let filestorage = new Filestorage(endpoint);
            await driver.findElement(webdriver.By.id('account')).sendKeys(process.env.ADDRESS);
            await driver.findElement(webdriver.By.id('storagePath')).sendKeys(fileName);
            await driver.findElement(webdriver.By.id('uploadFile')).click();
            await driver.sleep(2000);
            await confirmTransaction(driver);
            await driver.sleep(4000);
            await confirmTransaction(driver);
            await driver.sleep(4000);
            await confirmTransaction(driver);
            await driver.wait(webdriver.until.titleIs('Uploaded'), 100000);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            assert.isObject(isFind);
            assert.isTrue(isFind.uploadingProgress === 100);
        });

        afterEach(async function(){
            let filestorage = new Filestorage(endpoint);
            let fileList = await filestorage.listDirectory(helper.rmBytesSymbol(process.env.ADDRESS));
            let isFind = fileList.find(obj => {
                return obj.name === fileName;
            });
            if (isFind){
                await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
            }
        });

        after(async function () {
            await driver.quit();
        });
    });

    after(async function () {
        fs.rmdirSync(downloadDir);
    });
});
