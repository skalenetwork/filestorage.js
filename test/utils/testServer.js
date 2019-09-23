const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

router.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'../test.html'));
});

router.get('/filestorage',function(req,res){
    res.sendFile(path.join(__dirname,'../../dist/filestorage.min.js'));
});

function run() {
    app.use('/', router);
    app.listen(4000);
    console.log('Running at Port 4000');
}

function stop(){
    app.close();
}

run();
