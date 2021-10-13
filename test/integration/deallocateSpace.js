require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let endpoint = process.env.SCHAIN_ENDPOINT;
let pk = process.env.PK;
let addressToDeallocate = process.env.USER_ADDRESS;

let ownerAddress = getAddress(pk);
let filestorage = new Filestorage(endpoint, true);

async function allocateSpace() {
    const totalUsedSpace = await filestorage.getOccupiedSpace(addressToDeallocate);
    const getReservedSpace = await filestorage.getReservedSpace(addressToDeallocate);
    let availableSpaceToDeallocate = (getReservedSpace - totalUsedSpace);
    console.log('availableSpaceToDeallocate :', availableSpaceToDeallocate, 'for user :', addressToDeallocate);
    await filestorage.reserveSpace(ownerAddress, addressToDeallocate, totalUsedSpace, pk);
    console.log('availableSpaceToDeallocate after :', totalUsedSpace, 'for user :', addressToDeallocate);
}

allocateSpace();
