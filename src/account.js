const Web3 = require("web3");

const web3Instance = new Web3();

function restoreAccount(secretKey){
    const account = web3Instance.eth.accounts.privateKeyToAccount(secretKey);
    return account;
}

module.exports = {
    restoreAccount,
}