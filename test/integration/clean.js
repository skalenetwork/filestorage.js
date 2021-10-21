require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;
const helper = require('../../src/common/helper');

let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || null;
let address = getAddress(pk);
let filestorage = new Filestorage(endpoint, true);

async function clean() {
    if (type) {
        console.log(`Clean up ${type} files`);
    } else {
        console.log('Clean up tiny, medium, large files');
    }
    let files = await filestorage.listDirectory(helper.rmBytesSymbol(address));
    for (const file of files) {
        if (type === null) {
            if (file.name.startsWith('tiny') ||
                file.name.startsWith('medium') ||
                file.name.startsWith('large') ||
                file.name.startsWith('loop') || 
                file.name.startsWith('test')){
                await filestorage.deleteFile(address, file.name, pk);
            }
        } else {
            if (file.name.startsWith(type)) {
                await filestorage.deleteFile(address, file.name, pk);
            }
        }
    }
    console.log('Clean up finished');
}

clean();
