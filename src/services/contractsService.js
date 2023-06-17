import { ethers } from "ethers";
import CasinoAbi from "../backend/contractsData/Casino.json";
import CasinoAddress from "../backend/contractsData/Casino-address.json";
import CoinFlipAbi from "../backend/contractsData/CoinFlipGame.json";
import CoinFlipAddress from "../backend/contractsData/CoinFlipGame-address.json";



let casino = null;
let coinflip = null;

const loadContracts = async(signer) => {
    console.log("loadContracts started with signer:", signer);
    casino = new ethers.Contract(CasinoAddress.address, CasinoAbi.abi, signer);
    console.log("loadContracts ended");
}
const loadContractsCoinFlip = async(signer) => {
    console.log("loadContractsCoinFlip started with signer:", signer);
    coinflip = new ethers.Contract(CoinFlipAddress.address, CoinFlipAbi.abi, signer);
    console.log("loadContractsCoinFlip ended");
}

const tokenBalance = async(acc) =>{
    const balance = await casino.tokenBalance(acc);
    return parseInt(balance._hex);
}

const buyTokens = async(tokenNum, price) =>{
    await (await casino.compraTokens(tokenNum, {value: ethers.utils.parseEther(price.toString())})).wait();
}

const withdrawTokens = async(tokenNum) =>{
    await (await casino.devolverTokens(tokenNum)).wait();
}

const playRoulette = async(start, end, tokensBet) =>{
    const game = await (await casino.jugarRuleta(start.toString(), end.toString(), tokensBet.toString())).wait();
    let result
    try{
        result = {
            numberWon : parseInt(game.events[1].args[0]._hex),
            result: game.events[1].args[1],
            tokensEarned: parseInt(game.events[1].args[2]._hex)
        }
    }catch(error){
        result = {
            numberWon : parseInt(game.events[2].args[0]._hex),
            result: game.events[2].args[1],
            tokensEarned: parseInt(game.events[2].args[2]._hex)
        }
    }
    return result
}
const tokenPrice = async() =>{
    const price = await casino.precioTokens(1)
    return ethers.utils.formatEther(price._hex)
}

const historial = async(account) =>{
    const historial = await casino.tuHistorial(account)
    let historialParsed = []
    historial.map((game) => (
        historialParsed.push([game[2], parseInt(game[0]), parseInt(game[1])])
    ))
    return historialParsed
}

const playCoinFlip = async(coinSide, betAmount) => {
    console.log("playCoinFlip started with coinSide:", coinSide, "and betAmount:", betAmount);
    console.log("betAmount:", betAmount);
    console.log("betAmount type:", betAmount.type);
    let weiAmount = ethers.BigNumber.from(betAmount); // Convert Ether to Wei
    console.log("weiAmount:", weiAmount);
    console.log("weiAmount type:", weiAmount._hex.type);
    // let coinSideString = ethers.utils.parseEther((coinSide).toString()); // Convert Ether to Wei
    // console.log("coinSideString:", coinSideString);
    // console.log("coinSideString type:", coinSideString.type);
    console.log("About to call coinflip.placeBet with coinSide:", coinSide, "and weiAmount:", weiAmount._hex);
    const coingame = await (await coinflip.placeBet(coinSide, { value: weiAmount._hex })).wait(); // Place bet and wait for transaction confirmation
    console.log("coinflip.placeBet returned:", coingame);
    let RequestSentId
    try{
        RequestSentId = {
            requestId : coingame.events[1].args[0],
            numWords: coingame.events[1].args[1]
        }
    }catch(error){
        RequestSentId = {
            requestId : coingame.events[2].args[0],
            numWords: coingame.events[2].args[1]
        }
    }
    console.log("playCoinFlip ended with RequestSentId:", RequestSentId);
    return RequestSentId
}


// const calculateResult = async( ) => {
//    await (await coinflip.calculateResult(requestId)).wait(); // Calculate result and wait for transaction confirmation
//}

// export default {loadContracts, tokenBalance, buyTokens, tokenPrice, historial, playRoulette, withdrawTokens, loadContractsCoinFlip, playCoinFlip, calculateResult};
const contractsService = {
    loadContracts,
    tokenBalance,
    buyTokens,
    tokenPrice,
    historial,
    playRoulette,
    withdrawTokens,
    loadContractsCoinFlip,
    playCoinFlip
};

export default contractsService;