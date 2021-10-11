require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let endpoint = process.env.SCHAIN_ENDPOINT;
let pk = process.env.PK;
let addressToReserve = process.env.USER_ADDRESS;

const reservedSpace =  3 * 10 ** 8;

let ownerAddress = getAddress(pk);
let filestorage = new Filestorage(endpoint, true);

async function allocateSpace() {
    await filestorage.reserveSpace(ownerAddress, addressToReserve, reservedSpace, pk);
}

allocateSpace();
