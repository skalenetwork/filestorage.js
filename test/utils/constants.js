/**
 * @license
 * SKALE Filestorage-js
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
 * @file constants.js
 * @copyright SKALE Labs 2019-Present
 */

let path = require('path');

const errorMessages = {
    FILE_NOT_FOUND: 'File not found',
    FILE_NOT_EXISTS: 'File not exists',
    INVALID_PATH: 'Invalid path',
    INVALID_STORAGEPATH: 'Invalid storagePath',
    NOT_EMPTY_DIRECTORY: 'Directory is not empty',
    FILE_ALREADY_EXISTS: 'File or directory exists',
    INCORRECT_FILENAME: 'Filename should be < 256',
    INCORRECT_FILESIZE: 'File should be less than 100 MB',
    NOT_ENOUGH_FREE_SPACE: 'Not enough free space in the Filestorage',
    INCORRECT_CHUNK_POSITION: 'Incorrect position of chunk',
    INCORRECT_CHUNK_LENGTH: 'Incorrect chunk length',
    CHUNK_ALREADY_UPLOADED: 'Chunk is already uploaded',
    INVALID_KEYPAIR: 'Keypair mismatch',
    ONLY_BROWSER_METHOD: 'Method downloadToFile can only be used with a browser'
};

const fileStatus = {
    STATUS_NONEXISTENT: 0,
    STATUS_UPLOADING: 1,
    STATUS_COMPLETED: 2
};

const TEST_ACCOUNT_BALANCE = '1';
const TEST_SERVER_PORT = 4000;
const TEST_SERVER_ADDRESS = 'http://localhost:' + TEST_SERVER_PORT.toString(10);
const METAMASK_ID = 'ikhmppmeodmilchppjpiigoaonkpdocc';
const SHORT_TIMEOUT = 10000;
const LARGE_TIMEOUT = 100000;
const RESERVED_SPACE = 10 ** 9;
const EMPTY_ADDRESS = '0x6196d135CdDb9d73A0756C1E44b5b02B11acf594';
const SPACE_TEST_ADDRESS = '0xAa1a2301c7bbB4c244C1cF922BEeb660381BaD72';

const TEST_DATA_DIR = path.join(__dirname, '..', 'data');
const TEST_FILE = 'test.txt';
const CONFIG_FILE = 'base_config.json';
const ARTIFACTS_FILE = 'artifacts.json';
const TEST_FILE_PATH = path.join(TEST_DATA_DIR, TEST_FILE);
const CONFIG_FILE_PATH = path.join(TEST_DATA_DIR, CONFIG_FILE);
const ARTIFACTS_FILE_PATH = path.join(TEST_DATA_DIR, ARTIFACTS_FILE);

module.exports.errorMessages = errorMessages;
module.exports.fileStatus = fileStatus;
module.exports.TEST_ACCOUNT_BALANCE = TEST_ACCOUNT_BALANCE;
module.exports.TEST_SERVER_PORT = TEST_SERVER_PORT;
module.exports.TEST_SERVER_ADDRESS = TEST_SERVER_ADDRESS;
module.exports.METAMASK_ID = METAMASK_ID;
module.exports.SHORT_TIMEOUT = SHORT_TIMEOUT;
module.exports.LARGE_TIMEOUT = LARGE_TIMEOUT;
module.exports.RESERVED_SPACE = RESERVED_SPACE;
module.exports.EMPTY_ADDRESS = EMPTY_ADDRESS;
module.exports.TEST_FILE_PATH = TEST_FILE_PATH;
module.exports.CONFIG_FILE_PATH = CONFIG_FILE_PATH;
module.exports.ARTIFACTS_FILE_PATH = ARTIFACTS_FILE_PATH;
module.exports.SPACE_TEST_ADDRESS = SPACE_TEST_ADDRESS;
