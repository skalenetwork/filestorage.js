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
    STATUS_UNEXISTENT: 0,
    STATUS_UPLOADING: 1,
    STATUS_COMPLETED: 2
};

const TEST_ACCOUNT_BALANCE = '1';
const TEST_SERVER_PORT = 4000;
const TEST_SERVER_ADDRESS = 'http://localhost:' + TEST_SERVER_PORT.toString(10);
const METAMASK_ID = 'ikhmppmeodmilchppjpiigoaonkpdocc';
const SHORT_TIMEOUT = 10000;
const LARGE_TIMEOUT = 100000;
module.exports.errorMessages = errorMessages;
module.exports.fileStatus = fileStatus;
module.exports.TEST_ACCOUNT_BALANCE = TEST_ACCOUNT_BALANCE;
module.exports.TEST_SERVER_PORT = TEST_SERVER_PORT;
module.exports.TEST_SERVER_ADDRESS = TEST_SERVER_ADDRESS;
module.exports.METAMASK_ID = METAMASK_ID;
module.exports.SHORT_TIMEOUT = SHORT_TIMEOUT;
module.exports.LARGE_TIMEOUT = LARGE_TIMEOUT;
