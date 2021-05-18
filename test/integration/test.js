require('dotenv').config();
const Filestorage = require('../../src/index');

let Web3 = require('web3');
let fs = require('fs')
let pk = process.env.PK;
let endpoint = process.env.SCHAIN_ENDPOINT;
let type = process.env.TYPE || 'tiny';
let web3 = new Web3(endpoint);
let filestorage = new Filestorage(endpoint, true);


let fileNumber = {
    'tiny': 3000,
    'medium': 3000,
    'large': 50
}

async function upload(){
    let balanceStart = await web3.eth.getBalance(process.env.ACC1)
    let timeStart = new Date()
    console.log(balanceStart)
    console.log('timeStart: ', timeStart)
    for (let i = 1; i < fileNumber[type] ; ++i) {
        let directoryPath = __dirname+'/testFiles/'+type+'/'+type+i+'.txt'
        var content;
        var contentPath;
        content = await fs.readFileSync(directoryPath)
        contentPath = await filestorage.uploadFile(address,type+i+'.txt', content,  pk);
        console.log(contentPath);
        let balanceFinish = await web3.eth.getBalance(process.env.ACC1)
        let balanceFinishEth = await web3.utils.fromWei((balanceStart - balanceFinish).toString(),"ether")
        let receipt = contentPath.txs[0];
        console.log('contentPath ', receipt.contentPath)
        console.log('gasUsed ',receipt.gasUsed)
        console.log('blockNumber ', receipt.blockNumber)
        let timeEnd = new Date()
        console.log('balance:  ', balanceFinishEth)
        console.log('end: ', timeEnd)
    }

}

upload();


