require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let fs = require('fs');
let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || 'small';
let extention = process.env.EXTENTION;
let address = getAddress(pk);
let filestorage = new Filestorage(endpoint);

async function singleUpload() {
    const directoryPath = __dirname + '/testFiles/' + type + '/' + type + '.' + extention ;
    const content = await fs.readFileSync(directoryPath);
    const contentPath = await filestorage.uploadFile(address, type + '.' + extention, content, pk);
    console.log('contentPath', contentPath);
    let timeEnd = new Date();
    console.log('end: ', timeEnd);
}

singleUpload();
