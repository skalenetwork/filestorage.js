let webdriver = require('selenium-webdriver');
let Filestorage = require('../src/index');
const chromeOption = require('selenium-webdriver/chrome');
require('dotenv').config();

let chrome = require('chromedriver');
let chromeCapabilities = webdriver.Capabilities.chrome();
let chromeOptions = {
    'args': ['--test-type', '--start-maximized'],
    'prefs': {"download.default_directory":__dirname}
};

chromeCapabilities.set('chromeOptions', chromeOptions);
let driver = new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .build();

let fs = require('fs');
let path = require('path');
let html = path.join("file:///",__dirname,"test.html");

(async function example() {
    let fileName = 'test5';
    let endpoint = process.env.SKALE_ENDPOINT;
    let address = process.env.ADDRESS;
    let data = Buffer.from(fileName);
    let filestorage = new Filestorage(endpoint, true);
    let storagePath = await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
    try {
        driver.get(html);
        await driver.findElement(webdriver.By.id('SCHAIN_ENDPOINT')).sendKeys(endpoint);
        await driver.findElement(webdriver.By.id('storagePath')).sendKeys(storagePath);
        await driver.findElement(webdriver.By.id('downloadFile')).click();
        await driver.wait(webdriver.until.titleIs('Downloaded'), 100000);
        await driver.sleep(2000);
    } finally {
        await driver.quit();
        await filestorage.deleteFile(address, fileName, process.env.PRIVATEKEY);
    }
})();
