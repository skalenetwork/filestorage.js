const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const port = require('./constants').TEST_SERVER_PORT;
module.exports = {
    run() {
        router.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '../test.html'));
        });

        router.get('/filestorage', function (req, res) {
            res.sendFile(path.join(__dirname, '../../dist/filestorage.min.js'));
        });

        app.use('/', router);
        this.server = app.listen(port);
    },

    stop() {
        this.server.close();
    }
};
