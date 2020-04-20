/**
 * @license
 * SKALE Filestorage-js
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
 * @file MetamaskStub.js
 * @copyright SKALE Labs 2019-Present
 */
let webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const largeTimeout = require('./constants').LARGE_TIMEOUT;
module.exports = class MetamaskStub {
    constructor(metamaskId) {
        this.metamaskId = metamaskId;
    }

    async initialize(driver, password, seedPhrase) {
        await driver.get('chrome-extension://' + this.metamaskId + '/home.html');
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Continue')]")), largeTimeout);
        await driver.findElement(By.xpath("//*[contains(text(), 'Continue')]")).click();
        let seedPhraseXpath = "//*[contains(text(), 'Import with seed phrase')]";
        await driver.wait(until.elementLocated(By.xpath(seedPhraseXpath)), largeTimeout);
        await driver.findElement(By.xpath(seedPhraseXpath)).click();
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.findElement(By.id('confirm-password')).sendKeys(password);
        await driver.findElement(By.xpath(
            "//textarea[@placeholder='Separate each word with a single space']"
        )).sendKeys(seedPhrase);
        let element = driver.findElement(By.xpath("//button[contains(text(), 'Import')]"));
        await driver.wait(until.elementIsEnabled(element), largeTimeout);
        await element.click();
        await driver.wait(until.elementLocated(By.xpath("//div[@class='first-time-flow__markdown']")), largeTimeout);
        await driver.executeScript("document.querySelector('div.first-time-flow__markdown').scrollTop =" +
            "document.querySelector('div.first-time-flow__markdown').scrollHeight");
        element = driver.findElement(By.xpath("//button[contains(text(), 'Accept')]"));
        await driver.wait(until.elementIsEnabled(element), largeTimeout);
        await element.click();
        await driver.wait(until.elementIsEnabled(element), largeTimeout);
        await element.click();
        await driver.wait(until.elementIsEnabled(element), largeTimeout);
        await element.click();
    }

    async addEndpoint(driver, endpoint, chainId) {
        await driver.get('chrome-extension://' + this.metamaskId + '/home.html');
        let xpath = "//div[@class='app-header__network-component-wrapper']";
        await driver.wait(until.elementLocated(By.xpath(xpath)), largeTimeout);
        await driver.findElement(By.xpath(xpath)).click();
        await driver.findElement(By.xpath("//li[contains(., 'Custom RPC')]")).click();
        await driver.findElement(By.id('new-rpc')).sendKeys(endpoint);
        xpath = "//span[@class='settings-tab__advanced-link']";
        await driver.findElement(By.xpath(xpath)).click();
        await driver.findElement(By.id('chainid')).sendKeys(chainId);
        await driver.findElement(By.xpath("//button[contains(text(), 'Save')]")).click();
    }

    async addAccount(driver, privateKey) {
        await driver.get('chrome-extension://' + this.metamaskId + '/home.html');
        await driver.wait(until.elementLocated(By.xpath("//div[@class='identicon']")), largeTimeout);
        await driver.findElement(By.xpath("//div[@class='identicon']")).click();
        await driver.findElement(By.xpath("//div[contains(text(), 'Import Account')]")).click();
        await driver.findElement(By.id('private-key-box')).sendKeys(privateKey);
        await driver.findElement(By.xpath("//button[contains(text(), 'Import')]")).click();
    }

    async confirmTransaction(driver) {
        let currentWindow = await driver.getWindowHandle();
        let windows = await driver.getAllWindowHandles();
        for (let i = 0; i < windows.length; ++i) {
            await driver.switchTo().window(windows[i]);
            if (await driver.getTitle() === 'MetaMask Notification') {
                break;
            } else {
                driver.switchTo().window(currentWindow);
            }
        }
        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Confirm')]")), largeTimeout);
        await driver.findElement(By.xpath("//button[contains(text(), 'Confirm')]")).click();
        await driver.switchTo().window(currentWindow);
    }
};
