/**
 * @license
 * SKALE Filestorage-js
 * Copyright (C) 2019-Present SKALE Labs
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file testServer.js
 * @date 2019
 */
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const port = require('./constants').TEST_SERVER_PORT;
module.exports = {
    run() {
        router.get('/', function (req, res) {
            res.sendFile(path.join(__dirname, '../browser/test.html'));
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
