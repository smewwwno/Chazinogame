import { ethers } from "ethers";
import CasinoAbi from "../backend/contractsData/Casino.json";
import CasinoAddress from "../backend/contractsData/Casino-address.json";

let casino = null;

const loadContracts = async(signer) => {
    console.log("loadContracts started with signer:", signer);
    casino = new ethers.Contract(CasinoAddress.address, CasinoAbi.abi, signer);
    console.log("loadContracts ended");
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

const playCoinFlip = async(coinSide, betAmount, setFlipTrigger) => {
    console.log("setFlipTrigger is:", typeof setFlipTrigger);
    console.log("flipTrigger:", setFlipTrigger);
    console.log("playCoinFlip started with coinSide:", coinSide, "and betAmount:", betAmount);
    console.log("betAmount:", betAmount);
    console.log("betAmount type:", betAmount.type);
    let weiAmount = ethers.BigNumber.from(betAmount); // Convert Ether to Wei
    console.log("weiAmount:", weiAmount);
    console.log("About to call casino.placeBet with coinSide:", coinSide, "and betAmount:", betAmount);
    const coingame = await casino.placeBet(coinSide.toString(), weiAmount.toString());
    const receipt = await coingame.wait(); // Дождитесь завершения транзакции
    console.log("coinflip.placeBet receipt:", receipt);
    let RequestSentId
    let GameResultId
    try{
        // Найдите событие RequestSent в логах транзакции
        const event = receipt.events.find(e => e.event === 'RequestSent');
        if (event && event.args) {
            RequestSentId = {
                requestId: event.args[0],
                numWords: event.args[1]
            }
            console.log("Поймал RequestSentId:", RequestSentId.requestId);
            const resultgame = await casino.calculateResult(RequestSentId.requestId);
            const receiptgame = await resultgame.wait(); // Дождитесь завершения транзакции
            const eventgame = receiptgame.events.find(e => e.event === 'GameResult');
            console.log("Выплачиваю calculateResult", RequestSentId.requestId);
            if (eventgame && eventgame.args) {
                console.log("Поймал GameResult", eventgame);
                GameResultId = {
                    player: event.args[0],
                    win: event.args[1],
                    amount: event.args[2]
                }
                console.log("GameResultId:", GameResultId.win);
                console.log("GameResultId:", GameResultId.player);
                console.log("GameResultId:", GameResultId.amount);
                setFlipTrigger(false); // Останавливаем анимацию
                console.log("flipTrigger:", setFlipTrigger);
                console.log("setFlipTrigger is:", typeof setFlipTrigger);

            }
        } else {
            console.log("No RequestSent event found in transaction receipt");
        }
    }catch(error){
        console.log("Error processing transaction receipt:", error);
    }
    console.log("playCoinFlip ended with RequestSentId:", RequestSentId);
    return [RequestSentId, GameResultId]
}

const contractsService = {
    loadContracts,
    tokenBalance,
    buyTokens,
    tokenPrice,
    historial,
    playRoulette,
    withdrawTokens,
    playCoinFlip
};

export default contractsService;