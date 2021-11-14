const Web3 = require("web3");
const fs = require("fs");

const web3Instance = new Web3();

function restoreAccount(secretKey){
    const account = web3Instance.eth.accounts.privateKeyToAccount(secretKey);
    return account;
}

function createAccount(path) {
    const account = web3Instance.eth.accounts.create();
    console.log(`Made new account ${account.address}`)
    fs.writeFileSync(path, account.privateKey)
    console.log(`Account private key saved to ${path}`)
}

module.exports = {
    restoreAccount,
    createAccount
}