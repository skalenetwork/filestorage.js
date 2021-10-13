require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let fs = require('fs');
let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || 'small';
let address = getAddress(pk);
let filestorage = new Filestorage(endpoint);

async function singleUpload() {
    let content;
    let contentPath;
    let directoryPath;
    if (type !== 'hash') {
        directoryPath = __dirname + '/testFiles/' + type + '/' + type + '1.txt';
        content = await fs.readFileSync(directoryPath);
        contentPath = await filestorage.uploadFile(address, type + '.1txt', content, pk);
    } else {
        directoryPath = __dirname + '/testFiles/' + type + '/' + type + '1._hash';
        content = await fs.readFileSync(directoryPath);
        contentPath = await filestorage.uploadFile(address, type + '._hash', content, pk);
    };
    console.log(contentPath);
    let timeEnd = new Date();
    console.log('end: ', timeEnd);
}

singleUpload();
