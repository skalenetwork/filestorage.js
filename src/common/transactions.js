const helper = require('./helper');
const constants = require('./constants');
const InvalidCredentialsException = require('../exceptions/InvalidCredentialsException');
const FilestorageContractException = require('../exceptions/FilestorageContractException');

const Transactions = {
    async signAndSend(web3, account, privateKey, transactionData, gas) {
        let encoded = transactionData.encodeABI();
        let contractAddress = transactionData._parent._address;
        let accountFromPrivateKey = web3.eth.accounts.privateKeyToAccount(privateKey).address;
        if (account !== accountFromPrivateKey && account !== helper.rmBytesSymbol(accountFromPrivateKey)) {
            throw new InvalidCredentialsException(constants.errorMessages.INVALID_KEYPAIR);
        }
        let nonce = await web3.eth.getTransactionCount(account);
        let chainId = await web3.eth.getChainId();
        let tx = {
            from: account,
            data: encoded,
            gas: gas,
            to: contractAddress,
            nonce: nonce,
            chainId: chainId
        };
        let signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        return await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    },

    async sendWithExternalSigning(web3, account, transactionData, gas) {
        let nonce = await web3.eth.getTransactionCount(account);
        return await transactionData.send({
            from: account,
            gas: gas,
            nonce: nonce
        });
    },

    async send(web3, account, privateKey, transactionData, gas) {
        let result;
        try {
            if (typeof privateKey === 'string' && privateKey.length > 0) {
                privateKey = helper.addBytesSymbol(privateKey);
                helper.validatePrivateKey(privateKey);
                result = await this.signAndSend(web3, account, privateKey, transactionData, gas);
            } else {
                result = await this.sendWithExternalSigning(web3, account, transactionData, gas);
            }
            return result;
        } catch (error) {
            if (error.message.includes(constants.errorMessages.REVERTED_TRANSACTION)) {
                let errorMessage = error.message.substr(constants.errorMessages.REVERTED_TRANSACTION.length);
                let revertReason = JSON.parse(errorMessage).revertReason;
                if (revertReason) {
                    throw new FilestorageContractException(revertReason);
                } else {
                    throw new FilestorageContractException(constants.errorMessages.FAILED_TRANSACTION);
                }
            } else {
                throw error;
            }
        }
    }
};

module.exports = Transactions;
