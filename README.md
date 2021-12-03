# SKALE Filestorage.js

[![npm version](https://badge.fury.io/js/%40skalenetwork%2Ffilestorage.js.svg)](https://badge.fury.io/js/%40skalenetwork%2Ffilestorage.js)
[![Build Status](https://travis-ci.com/skalenetwork/filestorage.js.svg?branch=develop)](https://travis-ci.com/skalenetwork/filestorage.js)
[![codecov](https://codecov.io/gh/skalenetwork/filestorage.js/branch/develop/graph/badge.svg)](https://codecov.io/gh/skalenetwork/filestorage.js)
[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

Javascript library which implements client for decentralized file storage on SKALE chains.

-   Node.js v10, 12, and v14 support

## Install

Run the following command:

```sh
npm i --save @skalenetwork/filestorage.js   
```

## Usage

To use **Filestorage.js** you should have **SKALE endpoint**. 

Example: `http://some.local-or-remote.node:8546`

### Initiating of Filestorage

Construct new **Filestorage** object:

```javascript
new Filestorage(web3Provider, enableLogs);
```

#### Parameters

| Parameter                                  | Description                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| <code>String \| object</code> web3Provider | URL of **SKALE endpoint** or one of the [Web3 provider classes](https://web3js.readthedocs.io/en/1.0/web3.html#providers) |
| `boolean` enableLogs                       | _(optional)_ Enable/disable console logs                                                                                  |

##### Example

Initialize with **SKALE endpoint**:

```javascript
const Filestorage = require('@skalenetwork/filestorage.js');
let filestorage = new Filestorage('----SKALE ENDPOINT----');
```

Initialize with external **web3 provider**:

```javascript
const Filestorage = require('@skalenetwork/filestorage.js');
const Web3 = require('web3');

const web3Provider = new Web3.providers.HttpProvider('----SKALE ENDPOINT----');
let filestorage = new Filestorage(web3Provider);
```

### Using in HTML

To use filestorage.js in HTML you should import `filestorage.min.js` from npm package:

```html
<script src="PATH_TO_PACKAGE/@skalenetwork/filestorage.js/dist/filestorage.min.js"></script>
```

**Example**:

```html
<script src="PATH_TO_PACKAGE/@skalenetwork/filestorage.js/dist/filestorage.min.js"></script>
<script type="text/javascript">
    async function downloadFile() {
        let fs = new filestorage('----SKALE ENDPOINT----', true);
        await fs.downloadToFile('----STORAGEPATH----');
    }
</script>   
```

#### Upload file

 Upload file using internal signing:

```javascript
filestorage.uploadFile(address, filePath, fileBuffer, privateKey);
```

 Upload file using external signing (Metamask, etc.):

```javascript
filestorage.uploadFile(address, filePath, fileBuffer);
```

##### Parameters

| Parameter           | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `String` address    | Account address                                                   |
| `String` filePath   | Path of uploaded file in account directory                        |
| `Buffer` fileBuffer | Uploaded file data                                                |
| `String` privateKey | _(optional)_ Account private key, to sign transactions internally |

##### Returns

|   Type   | Description                                 |
| :------: | ------------------------------------------- |
| `String` | [Path of file in Filestorage](#storagePath) |

#### Download file

Download file from Filestorage into browser downloads folder:

```javascript
filestorage.downloadToFile(storagePath);
```

##### Parameters

| Parameter            | Description                                 |
| -------------------- | ------------------------------------------- |
| `String` storagePath | [Path of file in Filestorage](#storagePath) |

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

#### Delete file

Delete file using internal signing:

```javascript
filestorage.deleteFile(address, filePath, privateKey);
```

Delete file using external signing (Metamask etc):

```javascript
filestorage.deleteFile(address, filePath);
```

##### Parameters

| Parameter           | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `String` address    | Account address                                        |
| `String` filePath   | Path of the file in account directory to be deleted    |
| `String` privateKey | _(optional)_ Account private key, to sign transactions |

#### Create directory

Creates directory on the specific path. To create directory using internal signing:

```javascript
filestorage.createDirectory(address, directoryPath, privateKey);
```

Create directory using external signing (Metamask etc):

```javascript
filestorage.createDirectory(address, directoryPath);
```

##### Parameters

| Parameter              | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `String` address       | Account address                                        |
| `String` directoryPath | Path of the directory to be created                    |
| `String` privateKey    | _(optional)_ Account private key, to sign transactions |

##### Returns

| Parameter            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `String` storagePath | [Path of directory in Filestorage](#storagePath) |

#### Delete directory

Deletes directory on the specific path. To delete directory using internal signing:

```javascript
filestorage.deleteDirectory(address, directoryPath, privateKey);
```

Create directory using external signing (Metamask etc):

```javascript
filestorage.deleteDirectory(address, directoryPath);
```

##### Parameters

| Parameter              | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `String` address       | Account address                                        |
| `String` directoryPath | Path of the directory to be deleted                    |
| `String` privateKey    | _(optional)_ Account private key, to sign transactions |

#### List directory

Lists content of the specific directory

```javascript
filestorage.listDirectory(storagePath); 
```

##### Parameters

| Parameter            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `String` storagePath | [Path of directory in Filestorage](#storagePath) |

##### Returns

`Array` of content. Each content could be file or directory.

Content `Object` for file contains:

| Field                      | Description                                 |
| -------------------------- | ------------------------------------------- |
| `String` name              | File name                                   |
| `String` storagePath       | [Path of file in Filestorage](#storagePath) |
| `String` isFile            | Whether content is file                     |
| `number` size              | File size, in bytes                         |
| `number` status            | File uploading status                       |
| `number` uploadingProgress | Upload progress, in percents                |

Content `Object` for directory contains:

| Field                | Description                                      |
| -------------------- | ------------------------------------------------ |
| `String` name        | Directory name                                   |
| `String` storagePath | [Path of directory in Filestorage](#storagePath) |
| `String` isFile      | Whether content is file                          |

#### Reserve space

Reserve space for certain address in Filestorage in bytes.

-   **Note**: could be called only by sChain owner

```javascript
filestorage.reserveSpace(ownerAddress, addressToReserve, reservedSpace, privateKey);
```

Create directory using external signing (Metamask etc):

```javascript
filestorage.reserveSpace(ownerAddress, addressToReserve, reservedSpace);
```

##### Parameters

| Parameter                 | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `String` ownerAddress     | sChain owner address                                        |
| `String` addressToReserve | Address to reserve space for                                |
| `String` reservedSpace    | Reserved space in bytes                                     |
| `String` privateKey       | _(optional)_ sChain owner private key, to sign transactions |

## Development

### Install

```bash
git clone git@github.com:skalenetwork/filestorage.js.git
cd filestorage.js
npm install
```

#### Testing

First of all, please create random files for testing:

```bash
npm run generate
```

To run tests locally you need environment variables defining two keypairs (account, foreign account):

-   `SKALE_ENDPOINT`: SKALE endpoint
-   `SCHAIN_OWNER_PK`: SKALE chain owner privatekey
-   `PRIVATEKEY`: test account privatekey
-   `FOREIGN_PRIVATEKEY`: second test account privatekey

Then execute:

```bash
npm test
```

#### Browser testing

Requirements to run chrome integration tests:

-   Chrome v80

Required environment variables to run browser integration tests locally:

-   `SKALE_ENDPOINT`: SKALE endpoint
-   `SCHAIN_OWNER_PK`: SKALE chain owner privatekey
-   `PRIVATEKEY`: test account privatekey
-   `FOREIGN_PRIVATEKEY`: second test account privatekey
-   `SEED_PHRASE`: seed phrase to run metamask tests
-   `METAMASK_PASSWORD`: password to run metamask tests (> 7 chars)

Run tests:

```bash
npm run test test/browser
```

#### Build a dist version

```bash
npm run minify
```

**Publishing on npm:** 

```bash
npm publish
```

#### Versioning

The version scheme for this repo is `{major}.{minor}.{patch}`. 
For develop version scheme is `{major}.{minor}.{patch}-develop.{number}`
For beta version scheme is `{major}.{minor}.{patch}-beta.{number}`

For more details see: <https://semver.org/>

#### Lint

Conforming to linting rules is a prerequisite to commit to filestorage.js.

```bash
npm run lint
```

## Notes

### Storage path <a name="storagePath"></a>

Storage path is a label used to point to file or directory in Filestorage. It contains 2 parts through slash:
1. File owner address (without 0x)
2. File/directory path in owner's root directory

Example:

```bash
77333Da3492C4BBB9CCF3EA5BB63D6202F86CDA8/directoryA/random_text.txt
77333Da3492C4BBB9CCF3EA5BB63D6202F86CDA8/random_text.txt
0x77333Da3492C4BBB9CCF3EA5BB63D6202F86CDA8/random_text.txt #Invalid storagePath
```

## Contributing

**If you have any questions please ask our development community on [Discord](https://discord.gg/vvUtWJB).**

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

## License

![GitHub](https://img.shields.io/github/license/skalenetwork/filestorage.js.svg)

All contributions are made under the [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html). See [LICENSE](LICENSE).
