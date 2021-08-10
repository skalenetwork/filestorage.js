require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;


let endpoint = process.env.SCHAIN_ENDPOINT;
let pk = process.env.PK;

const reservedSpace = 3 * 10 ** 8;


let ownerAddress = getAddress(pk);
let filestorage = new Filestorage(endpoint, true);
let userAddress = "0x79e5b69c1A8E60eC77dc4Ce3b47A9DA8D801a426"

async function alocateSpace(){
    await filestorage.reserveSpace(ownerAddress, userAddress, reservedSpace, pk);
}


alocateSpace()