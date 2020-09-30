/**
 * @license
 * SKALE Filestorage-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file helper.js
 * @copyright SKALE Labs 2019-Present
 */
const constants = require('./constants');
const InvalidCredentialsException = require('../exceptions/InvalidCredentialsException');

const Helper = {

    ensureStartsWith0x(str) {
        if (str.length < 2) {return false;}
        return (str[0] === '0' && str[1] === 'x');
    },

    addBytesSymbol(str) {
        if (this.ensureStartsWith0x(str)) return str;
        return '0x' + str;
    },

    rmBytesSymbol(str) {
        if (!this.ensureStartsWith0x(str)) return str;
        return str.slice(2);
    },

    bufferToHex(buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },

    getBasename(string) {
        let re = /^(?:\/?|)(?:[\s\S]*?)((?:\.{1,2}|[^\/]+?|)(?:\.[^.\/]*|))(?:[\/]*)$/;
        return re.exec(string)[1];
    },

    concatBytes32Array(data, outputLength) {
        return data.map(x => this.rmBytesSymbol(x)).join('').slice(0, outputLength);
    },

    validatePrivateKey(privateKey) {
        if (!constants.PRIVATE_KEY_REGEX.test(privateKey)) {
            throw new InvalidCredentialsException(constants.errorMessages.INVALID_PRIVATEKEY);
        }
    }
};

module.exports = Helper;
