require('dotenv').config();
const Filestorage = require('../../src/index');
const getAddress = require('../utils/helper').getAddress;

let Web3 = require('web3');
let fs = require('fs')
let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || 'tiny';
let address = getAddress(pk);
let web3 = new Web3(endpoint);
let filestorage = new Filestorage(endpoint);

let fileNumber = {
    'tiny': 3000,
    'medium': 3000,
    'large': 50
}

const reservedSpace = 3 * 10 ** 8;

async function upload(){
    await filestorage.reserveSpace(address, address, reservedSpace, pk);
    let balanceStart = await web3.eth.getBalance(address);
    for (let i = 1; i < fileNumber[type] ; ++i) {
        let directoryPath = __dirname+'/testFiles/'+type+'/'+type+i+'.txt';
        var content;
        var contentPath;
        content = await fs.readFileSync(directoryPath);
        contentPath = await filestorage.uploadFile(address,type+i+'.txt', content,  pk);
        console.log(contentPath);
        let balanceFinish = await web3.eth.getBalance(address);
        let balanceFinishEth = await web3.utils.fromWei((balanceStart - balanceFinish).toString(),"ether");
        let timeEnd = new Date();
        console.log('balance:  ', balanceFinishEth);
        console.log('end: ', timeEnd);
    }
}

upload();
