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

module.exports.errorMessages = errorMessages;
module.exports.fileStatus = fileStatus;
