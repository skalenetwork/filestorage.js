
const Filestorage = require('../filestorage.js/src/index.js');
let filestorage = new Filestorage('http://138.68.238.222:10079', true);

let address='d2c5b39B4e735C17612Bb5a08FD024ccc5dBCb23'
let pk=''
	
filestorage.deleteFile(address, 'tinyFile.txt',  pk);





