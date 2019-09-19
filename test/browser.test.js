let webdriver = require('selenium-webdriver');
let Filestorage = require('../src/index');
const chromeOption = require('selenium-webdriver/chrome');
require('dotenv').config();

let chrome = require('chromedriver');
let chromeCapabilities = webdriver.Capabilities.chrome();
let chromeOptions = {
    'args': ['--test-type', '--start-maximized'],
    'prefs': {"download.default_directory":"/home/(user)/Downloads/Chrome_test"}
};
chromeCapabilities.set('chromeOptions', chromeOptions);
let driver = new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .build();

let path = require('path');
let html = path.join("file:///",__dirname,"test.html");

(async function example() {
    try {
        driver.get(html);
        let fileName = 'test';
        let endpoint = process.env.SKALE_ENDPOINT;
        let address = process.env.ADDRESS;
        let data = Buffer.from(fileName);
        let filestorage = new Filestorage(endpoint, true);
        let storagePath = await filestorage.uploadFile(address, fileName, data, process.env.PRIVATEKEY);
        await driver.findElement(webdriver.By.id('SCHAIN_ENDPOINT')).sendKeys(endpoint);
        await driver.findElement(webdriver.By.id('storagePath')).sendKeys(storagePath);
        await driver.wait(webdriver.until.titleIs('Test'), 100000);
    } finally {
        await driver.quit();
    }
})();
