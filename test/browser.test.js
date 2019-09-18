let webdriver = require('selenium-webdriver');
let chrome = require('chromedriver');
let chromeCapabilities = webdriver.Capabilities.chrome();
const chromeOption = require('selenium-webdriver/chrome');
//setting chrome options to start the browser fully maximized
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
        await driver.wait(webdriver.until.titleIs('Test'), 10000);
    } finally {
        await driver.quit();
    }
})();
