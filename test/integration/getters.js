require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let endpoint = process.env.SCHAIN_ENDPOINT;
let pk = process.env.PK;

let address = getAddress(pk);
let filestorage = new Filestorage(endpoint, true);

async function getters() {
    const getOccupiedSpace = await filestorage.getOccupiedSpace(address);
    const getReservedSpace = await filestorage.getReservedSpace(address);
    const getTotalSpace = await filestorage.getTotalSpace();
    const getTotalReservedSpace = await filestorage.getTotalReservedSpace();

    let getOccupiedSpaceMB = getOccupiedSpace === 0 ? getOccupiedSpace + ' MB' : getOccupiedSpace / 1000000 + ' MB';
    let getReservedSpaceMB = getReservedSpace === 0 ? getReservedSpace + ' MB' : getReservedSpace / 1000000 + ' MB';
    let getTotalSpaceMB = getTotalSpace === 0 ? getTotalSpace + ' MB' : getTotalSpace / 1000000 + ' MB';
    let getTotalReservedSpaceMB = getTotalReservedSpace === 0 ?
        getTotalReservedSpace + ' MB' : getTotalReservedSpace / 1000000 + ' MB';

    console.log(' getOccupiedSpace for ', address, ' is ', getOccupiedSpaceMB);
    console.log(' getReservedSpace for ', address, '  is ', getReservedSpaceMB);
    console.log(' getTotalSpace is ', getTotalSpaceMB);
    console.log(' getTotalReservedSpace is ', getTotalReservedSpaceMB);
}

getters();

