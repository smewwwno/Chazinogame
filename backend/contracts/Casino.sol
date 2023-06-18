// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Token.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Casino is VRFConsumerBaseV2, ConfirmedOwner {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event GameResult(address indexed player, bool win, uint256 amount);

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    mapping(uint256 => RequestStatus) public s_requests;
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 s_subscriptionId = 5282;
    uint256[] public requestIds;
    uint256 public lastRequestId;
    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 400000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    mapping(address => uint256) public bets;
    mapping(address => uint) public coinSide;
    address[] public players;

    event RouletteGame (
        uint NumberWin,
        bool result,
        uint tokensEarned
    );

    ERC20 private token;
    address public tokenAddress;

    function precioTokens(uint256 _numTokens) public pure returns (uint256){
        return _numTokens * (0.001 ether);
    }

    function tokenBalance(address _of) public view returns (uint256){
        return token.balanceOf(_of);
    }
    
    constructor()
    VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
    ConfirmedOwner(msg.sender)
    {
        token =  new ERC20("Casino", "CAS");
        tokenAddress = address(token);
        token.mint(1000000);
        COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
    }

    // Visualizacion del balance de ethers del Smart Contract
    function balanceEthersSC() public view returns (uint256){
        return address(this).balance;
    }

    function getAdress() public view returns (address){
        return address(token);

    }

    function compraTokens(uint256 _numTokens) public payable{
        // Registro del ususario
        // Establecimiento del coste de los tokens a comprar
        // Evaluacion del dinero que el cliente paga por los tokens
        require(msg.value >= precioTokens(_numTokens), "Compra menos tokens o paga con mas ethers");
        // Creacion de nuevos tokens en caso de que no exista suficiente supply
        if  (token.balanceOf(address(this)) < _numTokens){
            token.mint(_numTokens*100000);
        }
        // Devolucion del dinero sobrante
        // El Smart Contract devuelve la cantidad restante
        payable(msg.sender).transfer(msg.value - precioTokens(_numTokens));
        // Envio de los tokens al cliente/usuario
        token.transfer(address(this), msg.sender, _numTokens);
    }

    // Devolucion de tokens al Smart Contract
    function devolverTokens(uint _numTokens) public payable {
        // El numero de tokens debe ser mayor a 0
        require(_numTokens > 0, "Necesitas devolver un numero de tokens mayor a 0");
        // El usuario debe acreditar tener los tokens que quiere devolver
        require(_numTokens <= token.balanceOf(msg.sender), "No tienes los tokens que deseas devolver");
        // El usuario transfiere los tokens al Smart Contract
        token.transfer(msg.sender, address(this), _numTokens);
        // El Smart Contract envia los ethers al usuario
        payable(msg.sender).transfer(precioTokens(_numTokens));
    }

    struct Bet {
        uint tokensBet;
        uint tokensEarned;
        string game;
    }

    struct RouleteResult {
        uint NumberWin;
        bool result;
        uint tokensEarned;
    }

    mapping(address => Bet []) historialApuestas;

    function retirarEth(uint _numEther) public payable onlyOwner {
        // El numero de tokens debe ser mayor a 0
        require(_numEther > 0, "Necesitas devolver un numero de tokens mayor a 0");
        // El usuario debe acreditar tener los tokens que quiere devolver
        require(_numEther <= balanceEthersSC(), "No tienes los tokens que deseas devolver");
        // Transfiere los ethers solicitados al owner del smart contract'
        payable(owner()).transfer(_numEther);
    }

    function tuHistorial(address _propietario) public view returns(Bet [] memory){
        return historialApuestas[_propietario];
    }

    function jugarRuleta(uint _start, uint _end, uint _tokensBet) public{
        require(_tokensBet <= token.balanceOf(msg.sender));
        require(_tokensBet > 0);
        uint random = uint(uint(keccak256(abi.encodePacked(block.timestamp))) % 14);
        uint tokensEarned = 0;
        bool win = false;
        token.transfer(msg.sender, address(this), _tokensBet);
        if ((random <= _end) && (random >= _start)) {
            win = true;
            if (random == 0) {
                tokensEarned = _tokensBet*14;
            } else {
                tokensEarned = _tokensBet * 2;
            }
            if  (token.balanceOf(address(this)) < tokensEarned){
                token.mint(tokensEarned*100000);
            }
            token.transfer( address(this), msg.sender, tokensEarned);
        }
        addHistorial("Roulete", _tokensBet, tokensEarned, msg.sender);
        emit RouletteGame(random, win, tokensEarned);
    }

    function addHistorial(string memory _game, uint _tokensBet,  uint _tokenEarned, address caller) internal{
        Bet memory apuesta = Bet(_tokensBet, _tokenEarned, _game);
        historialApuestas[caller].push(apuesta);
    }


    function placeBet(uint _coinSide, uint _tokensBet) public payable {
        require(_tokensBet <= token.balanceOf(msg.sender));
        require(_tokensBet > 0, "Already placed bet");
        bets[msg.sender] = _tokensBet;
        coinSide[msg.sender] = _coinSide;
        token.transfer(msg.sender, address(this), _tokensBet);
        players.push(msg.sender);  // Добавляем адрес игрока в список

        // Request random words after placing the bet
        uint256 requestId = requestRandomWords();
        emit RequestSent(requestId, numWords);
    }

    function requestRandomWords() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });

        requestIds.push(requestId);
        lastRequestId = requestId;
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function calculateResult(uint256 _requestId) external {
        require(s_requests[_requestId].exists, "request not found");
        require(s_requests[_requestId].fulfilled, "request not fulfilled");
        uint256[] memory _randomWords = s_requests[_requestId].randomWords;

        // Assuming the first random word is used for the coin flip
        uint coinflip = _randomWords[0] % 2 == 0 ? 1 : 0;


        // Iterate over all players and determine if they won or lost
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];  // Используем адрес из списка игроков
            uint playerSide = coinSide[player];

            if (playerSide == coinflip) {
                // Player won, transfer them their winnings
                uint256 winnings = bets[player] * 2;
                emit GameResult(player, true, winnings);
                token.transfer(address(this), player, winnings);
            } else {
                // Player lost, emit a loss event
                emit GameResult(player, false, bets[player]);
            }

            // Reset player's bet
            delete bets[player];
            delete coinSide[player];
        }

        // Reset players list
        delete players;
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
    

}
