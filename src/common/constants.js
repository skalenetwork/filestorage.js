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
 * @file constants.js
 * @date 2019
 */
const FILESTORAGE_CONTRACTNAME = 'FileStorage.sol:FileStorage';

const CHUNK_LENGTH = 1048576;
const STANDARD_GAS = 1000000;
const WRITING_GAS = 160000000;

const errorMessages = {
    FAILED_TRANSACTION: 'Transaction has been failed',
    REVERTED_TRANSACTION: 'Transaction has been reverted by the EVM:',
    INVALID_KEYPAIR: 'Keypair mismatch',
    INVALID_PRIVATEKEY: 'Incorrect privateKey'
};

module.exports.WRITING_GAS = WRITING_GAS;
module.exports.STANDARD_GAS = STANDARD_GAS;
module.exports.CHUNK_LENGTH = CHUNK_LENGTH;
module.exports.FILESTORAGE_CONTRACTNAME = FILESTORAGE_CONTRACTNAME;
module.exports.errorMessages = errorMessages;
