# SKALE Filestorage.js

[![npm version](https://badge.fury.io/js/%40skalenetwork%2Ffilestorage.js.svg)](https://badge.fury.io/js/%40skalenetwork%2Ffilestorage.js)
[![Build Status](https://travis-ci.com/skalenetwork/filestorage.js.svg?branch=develop)](https://travis-ci.com/skalenetwork/filestorage.js)
[![codecov](https://codecov.io/gh/skalenetwork/filestorage.js/branch/develop/graph/badge.svg)](https://codecov.io/gh/skalenetwork/filestorage.js)
[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

Javascript library which implements client for decentralized file storage on SKALE chains.

-   Node.js v8 and v10+ support

## Install

Run the following command:

```sh
npm i --save @skalenetwork/filestorage.js   
```

## Usage

To use **Filestorage.js** you should have **SKALE endpoint**. 

Example: `http://some.local-or-remote.node:8546`

#### Initiating of Filestorage

Construct new **Filestorage** object:

```javascript
new Filestorage(web3Provider, enableLogs);
```

##### Parameters

| Parameter                                  | Description                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| <code>String \| object</code> web3Provider | URL of **SKALE endpoint** or one of the [Web3 provider classes](https://web3js.readthedocs.io/en/1.0/web3.html#providers) |
| `boolean` enableLogs                       | _(optional)_ Enable/disable console logs                                                                                  |

##### Example

Initialize with **SKALE endpoint**:

```javascript
const Filestorage = require('@skalenetwork/filestorage.js/src/index');
let filestorage = new Filestorage('----SKALE ENDPOINT----');
```

Initialize with external **web3 provider**:

```javascript
const Filestorage = require('@skalenetwork/filestorage.js/src/index');
const Web3 = require('web3');

const web3Provider = new Web3.providers.HttpProvider('----SKALE ENDPOINT----');
let filestorage = new Filestorage(web3Provider);
```

#### Upload file

 Upload file using internal signing:

```javascript
filestorage.uploadFile(address, fileName, fileBuffer, privateKey);
```

 Upload file using external signing (Metamask, etc.):

```javascript
filestorage.uploadFile(address, fileName, fileBuffer);
```

##### Parameters

| Parameter           | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `String` address    | Account address                                                   |
| `String` fileName   | Name of uploaded file                                             |
| `Buffer` fileBuffer | Uploaded file data                                                |
| `String` privateKey | _(optional)_ Account private key, to sign transactions internally |

##### Returns

|   Type   | Description                                 |
| :------: | ------------------------------------------- |
| `String` | [Path of file in Filestorage](#storagePath) |

# 

#### Download file

Download file from Filestorage into browser downloads folder:

```javascript
filestorage.downloadToFile(storagePath);
```

##### Parameters

| Parameter            | Description                                 |
| -------------------- | ------------------------------------------- |
| `String` storagePath | [Path of file in Filestorage](#storagePath) |

# 

#### Download buffer

Download file from Filestorage into buffer

```javascript
filestorage.downloadToBuffer(storagePath); 
```

##### Parameters

| Parameter            | Description                                 |
| -------------------- | ------------------------------------------- |
| `String` storagePath | [Path of file in Filestorage](#storagePath) |

##### Returns

|   Type   | Description  |
| :------: | ------------ |
| `Buffer` | File content |

# 

#### Delete file

Delete file using internal signing:

```javascript
filestorage.deleteFile(yourAddress, fileName, privateKey);
```

Delete file using external signing (Metamask etc):

```javascript
filestorage.deleteFile(yourAddress, fileName);
```

##### Parameters

| Parameter           | Description                               |
| ------------------- | ----------------------------------------- |
| `String` address    | Account address                           |
| `String` fileName   | Name of the file to be deleted            |
| `String` privateKey | Account private key, to sign transactions |

# 

#### Get file info

Get information about files in Filestorage for specific account:

```javascript
filestorage.getFileInfoListByAddress(address);
```

##### Parameters

| Parameter        | Description     |
| ---------------- | --------------- |
| `String` address | Account address |

##### Returns

`Array` of file description objects.

Each description `Object` contains:

| Field                      | Description                                 |
| -------------------------- | ------------------------------------------- |
| `String` name              | File name                                   |
| `number` size              | File size, in bytes                         |
| `String` storagePath       | [Path of file in Filestorage](#storagePath) |
| `number` uploadingProgress | Upload progress, in percents                |

## Development

#### Install

    git clone git@github.com:skalenetwork/filestorage.js.git
    cd filestorage.js
    npm install

#### Testing

First of all, please create random files for testing:

    npm run generate

To run tests locally you need environment variables defining test file path
and three keypairs (address, foreign, empty):

-   `TEST_FILE_PATH`: path to generated file. Default `./test.txt`
-   `ENTRYPOINT`: SKALE endpoint
-   `ADDRESS`: test account address
-   `PRIVATEKEY`: test account privatekey
-   `FOREIGN_ADDRESS`: second test account address
-   `FOREIGN_PRIVATEKEY`: second test account privatekey
-   `EMPTY_ADDRESS`: third test account address
-   `EMPTY_PRIVATEKEY`: third test account privatekey

Then execute:

```bash
npm test
```

#### Build a dist version

**Note:** Build scripts also do version updating in `package.json`

```bash
# build patch version
npm run build-patch

# build minor version
npm run build-minor

# build major version
npm run build-major
```

**Publishing on npm:** 

```bash
npm publish
```

#### Versioning

The version scheme for this repo is {major}.{minor}.{patch} For more details see: <https://semver.org/>

#### Lint

Conforming to linting rules is a prerequisite to commit to filestorage.js.

```bash
npm run lint
```

## Notes

#### Storage path <a name="storagePath"></a>

Storage path is a label used to point to file in Filestorage. It contains 2 parts through slash:
1. File owner address (without 0x)
2. File name

Example:

    77333Da3492C4BBB9CCF3EA5BB63D6202F86CDA8/random_text.txt

## Contributing

**If you have any questions please ask our development community on [Discord](https://discord.gg/vvUtWJB).**

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

# License

![GitHub](https://img.shields.io/github/license/skalenetwork/filestorage.js.svg)

All contributions are made under the [GNU Lesser General Public License v3](https://www.gnu.org/licenses/lgpl-3.0.en.html). See [LICENSE](LICENSE).
