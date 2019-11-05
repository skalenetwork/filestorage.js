const path = require('path')
const http = require('http');
require('dotenv').config();
const Filestorage = require('../../src/index');
const FilestorageStub = require('../utils/FilestorageStub');
let Web3 = require('web3');
let web3 = new Web3(process.env.SCHAIN_ENDPOINT)
let schain_address = process.env.SCHAIN_ENDPOINT
let filestorageInstance = new Filestorage(schain_address, true);
let filestorage = new FilestorageStub(filestorageInstance);
let fs = require('fs')
let address= process.env.ACC1
let pk = process.env.PK1

async function upload(){
    let balanceStart = await web3.eth.getBalance(process.env.ACC1)
    let timeStart = new Date()
    console.log(balanceStart)
    console.log('timeStart: ', timeStart)
    for (let i = 2902; i < 100000 ; ++i) {
        let directoryPath = __dirname+'/testFiles/tiny/tiny'+i+'.txt'
        var content;
        var contentPath;
        content = await fs.readFileSync(directoryPath)
//        console.log(content);   // Put all of the code here (not the best solution)
        contentPath = await filestorage.uploadFile(address,'tiny'+i+'.txt', content,  pk);
//        console.log(contentPath);
        let balanceFinish = await web3.eth.getBalance(process.env.ACC1)
        let balanceFinishEth = await web3.utils.fromWei((balanceStart - balanceFinish).toString(),"ether")
        let receipt = contentPath.txs[0];
        console.log('contentPath ', receipt.contentPath)
        console.log('gasUsed ',receipt.gasUsed)
        console.log('blockNumber ', receipt.blockNumber)
//        gasUsed = await (balanceStart - balanceFinish).
//        console.log(gasUsed)
        let timeEnd = new Date()
        console.log('balance:  ', balanceFinishEth)
        console.log('end: ', timeEnd)
    }

}

upload();


