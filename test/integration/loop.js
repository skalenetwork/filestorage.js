require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let fs = require('fs');
let Web3 = require('web3');
let path = require('path');

let endpoint = process.env.SCHAIN_ENDPOINT;
let pk = process.env.PK;

const filePath = path.join(__dirname, '..', 'data', 'loopFile.txt');
const reservedSpace = 3 * 10 ** 8;

let address = getAddress(pk);
let web3 = new Web3(endpoint);
let filestorage = new Filestorage(endpoint, true);

async function upload(){
    await filestorage.reserveSpace(address, address, reservedSpace, pk);
    let balanceStart = await web3.eth.getBalance(address)
    let timeStart = new Date()
    console.log(balanceStart)
    console.log('start: ', timeStart)
    let contentPath;
    let content = await fs.readFileSync(filePath);
    for (let i = 1; i < 10 ; ++i) {
        contentPath = await filestorage.uploadFile(address,'loopFile.txt', content,  pk);
        console.log(contentPath);
        removeFile = await filestorage.deleteFile(address, 'tinyFile.txt',  pk);
    }

}

upload();