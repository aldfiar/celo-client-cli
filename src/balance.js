const web3 = require("web3");
const {ethers} = require("ethers");
const {BigNumber} = require('bignumber.js')

const celoTokens = ['CELO', 'CUSD', 'CEUR']

function bigNumberWithDecimalToStr(n, d) {
    let modified = n instanceof BigNumber ? ethers.BigNumber.from(n.toFixed()) : n;
    const result = ethers.utils.formatUnits(modified, d);
    return result.toString()
}


async function getBalance(kit, tokens, address) {
    const balances = await kit.getTotalBalance(address)
    const usdBalance = bigNumberWithDecimalToStr(balances.cUSD);
    const celoBalance = bigNumberWithDecimalToStr(balances.CELO);
    const euroBalance = bigNumberWithDecimalToStr(balances.cEUR);

    console.log(`cUSD balance: ${usdBalance}`)
    console.log(`CELO balance: ${celoBalance}`)
    console.log(`cEUR balance: ${euroBalance}`)

    for (const token of tokens) {
        if (!celoTokens.includes(token.name)) {
            const tokenData = await kit.contracts.getErc20(token['address']);
            const balance = await tokenData.balanceOf(address)
            const formattedBalance = bigNumberWithDecimalToStr(balance, token.decimals);
            console.log(`${token.name} balance: ${formattedBalance}`);
        }
    }
}

async function transferErc(kit, address, tokenAddress, amount) {
    const token = await kit.contracts.getErc20(tokenAddress);
    const tx = await token.transfer(address, amount).send();
    const receipt = await tx.waitReceipt();
    return receipt;
}

async function transferCelo(kit, address, tokenName, amount) {
    const wrapper = await getCeloTokenWrapper(kit, tokenName);
    const tx = await wrapper.transfer(address, amount).send();
    const receipt = await tx.waitReceipt();
    return receipt;
}


async function getCeloTokenWrapper(kit, tokenName) {
    const wrappers = await kit.celoTokens.getWrappers()
    let token;
    if (wrappers) {
        if (tokenName === "CELO") {
            token = await wrappers.CELO
        }
        if (tokenName === "CUSD") {
            token = await wrappers.cUSD
        }
        if (tokenName === "CEUR") {
            token = await wrappers.cEUR
        }
    }
    return token;
}

async function sendPayment(kit, amount, token, to, tokens) {
    const stringAmount = amount.toString()
    let result

    let element = token.toUpperCase();
    let receipt = "token not found";
    if (celoTokens.includes(element)) {
        result = web3.utils.toWei(stringAmount).toString()
        receipt = await transferCelo(kit, to, element, result);
    } else {
        for (const tokenData of tokens) {
            if (tokenData.symbol === element) {
                result = ethers.utils.parseUnits(stringAmount, tokenData.decimals).toString()
                receipt = await transferErc(kit, to, tokenData.address, result);
            }
        }
    }

    console.log(`Sent of ${amount} ${token} to ${to}`)

    return receipt;
}

module.exports = {
    getBalance,
    sendPayment,
}
