// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract CoinFlipGame is VRFConsumerBaseV2, ConfirmedOwner {
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

    uint64 s_subscriptionId = 5094;
    uint256[] public requestIds;
    uint256 public lastRequestId;
    bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 400000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    mapping(address => uint256) public bets;
    mapping(address => bool) public coinSide;
    address[] public players;

    constructor()
    VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed)
    ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed);
    }

    function placeBet(bool _coinSide) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(bets[msg.sender] == 0, "Already placed bet");

        bets[msg.sender] = msg.value;
        coinSide[msg.sender] = _coinSide;
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
        bool coinFlip = _randomWords[0] % 2 == 0;

        // Iterate over all players and determine if they won or lost
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];  // Используем адрес из списка игроков
            bool playerSide = coinSide[player];

            if (playerSide == coinFlip) {
                // Player won, transfer them their winnings
                uint256 winnings = bets[player] * 2;
                payable(player).transfer(winnings);
                emit GameResult(player, true, winnings);
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

    function getAddress() public view returns (address){
        return address(this);
    }

    // fallback function to receive MATIC
    receive() external payable {}
}