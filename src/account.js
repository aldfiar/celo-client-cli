const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

const web3Instance = new Web3();

function restoreAccount(secretKey){
    const account = web3Instance.eth.accounts.privateKeyToAccount(secretKey);
    return account;
}

function createAccount(secretKey) {
    const account = web3Instance.eth.accounts.create();
    console.log(`Made new account ${account.address}`)
    fs.writeFileSync(secretKey, account.privateKey)
    console.log(`Account private key saved to ${secretKey}`)
}

function convertAccount(account, password, storage){
    let encrypted = web3Instance.eth.accounts.encrypt(account.privateKey, password);
    let result = path.join(storage, account.address);
    fs.writeFileSync(result, JSON.stringify(encrypted));
}

module.exports = {
    restoreAccount,
    createAccount,
    convertAccount
}