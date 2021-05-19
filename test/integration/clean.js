require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;
const helper = require('../../src/common/helper');

let Web3 = require('web3');
let fs = require('fs')
let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || null;
let address = getAddress(pk);
let filestorage = new Filestorage(endpoint);

async function clean(){
    let files = await filestorage.listDirectory(helper.rmBytesSymbol(address));
    for (const file of files) {
        if (type === null) {
            if (file.name.startsWith('tiny') ||
                file.name.startsWith('medium') ||
                file.name.startsWith('large')) {
                await filestorage.deleteFile(address, file.name, pk);
            }
        } else {
            if (file.name.startsWith('tiny')) {
                await filestorage.deleteFile(address, file.name, pk);
            }
        }
    }
}

clean();
