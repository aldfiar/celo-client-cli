const fs = require("fs");
const path = require('path')
const contractKit = require("@celo/contractkit");
const yargs = require("yargs");
const {sendPayment} = require("./balance");
const {hideBin} = require("yargs/helpers");
const {restoreAccount, createAccount} = require("./account");
const {getBalance} = require("./balance");

function loadTokens(tokensPath, chainName) {
    const parent = path.resolve(__dirname, '..')
    let tokenList = fs.readFileSync(path.resolve(parent, tokensPath));
    let tokens = JSON.parse(tokenList);
    let tokensAddresses = tokens[chainName];
    return tokensAddresses;
}

function createKit(url) {
    const kit = contractKit.newKit(url);
    return kit;
}
async function createAccountCli(argv){
    createAccount(argv.account);
}

async function getUserBalance(argv) {
    const {kit, account} = initialize(argv.account, argv.provider)
    const tokens = loadTokens(argv.tokens, argv.chain)
    await getBalance(kit, tokens, account.address);
}

async function sendToken(argv) {
    const {kit, account} = initialize(argv.account, argv.provider)
    const tokens = loadTokens(argv.tokens, argv.chain)
    const result = await sendPayment(kit, argv.amount, argv.token, argv.to, tokens)
    console.log(`Receipt: ${JSON.stringify(result, null, 4)}`)

}

function initialize(privateKeyPath, provider) {
    const parent = path.resolve(__dirname, '..')
    let secret = fs.readFileSync(path.resolve(parent, privateKeyPath), 'utf-8');
    let kit = createKit(provider);
    let account = restoreAccount(secret);
    kit.addAccount(account.privateKey)
    kit.defaultAccount = account.address

    console.log(`Account ${account.address} is initialised`)

    return {kit, account};
}

const argv = yargs(hideBin(process.argv))
    .option('account', {
        alias: 'a',
        describe: 'path to account',
    })
    .option('tokens', {
        alias: 't',
        describe: 'path to tokens',
        default: 'resources/ubeswap_route_tokens.json'
    })
    .option('provider', {
        alias: 'p',
        describe: 'rpc address',
        default: "https://forno.celo.org"
    })
    .option('chain', {
        alias: 'c',
        describe: 'net name',
        default: "mainnet"
    })
    .command('create', 'Create account', yargs => yargs, createAccountCli)
    .command('get-balance', 'Get token balances for account', yargs => yargs, getUserBalance)
    .command('send', 'Get token balances for account', yargs => {
        return yargs
            .options('to', {
                string: true,
                describe: 'transfer to',
            }).options('amount', {
                describe: "amount tokens"
            }).options('token', {
                describe: "token name"
            })
    }, sendToken)
    .help()
    .argv;
