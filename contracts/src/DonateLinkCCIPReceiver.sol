// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IDonateLinkMain {
    function recordCrossChainDonation(
        address _donor,
        address _streamer,
        address _token,
        uint256 _amount,
        string calldata _donorName,
        string calldata _message,
        string calldata _sourceChain
    ) external;
}

contract DonateLinkCCIPReceiver is CCIPReceiver, Ownable {
    using SafeERC20 for IERC20;

    IDonateLinkMain public donateLinkMain;

    mapping(uint64 => bool) public allowlistedSourceChains;
    mapping(uint64 => address) public allowlistedSenders;
    mapping(uint64 => string) public chainNames;

    event CrossChainDonationReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address donor,
        address streamer
    );

    error SourceChainNotAllowed(uint64 sourceChainSelector);
    error SenderNotAllowed(address sender);

    constructor(
        address _router,
        address _donateLinkMain
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        donateLinkMain = IDonateLinkMain(_donateLinkMain);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        uint64 sourceChain = message.sourceChainSelector;
        address sender = abi.decode(message.sender, (address));

        if (!allowlistedSourceChains[sourceChain]) revert SourceChainNotAllowed(sourceChain);
        if (allowlistedSenders[sourceChain] != sender) revert SenderNotAllowed(sender);

        (
            address donor,
            address streamer,
            string memory donorName,
            string memory donorMessage
        ) = abi.decode(message.data, (address, address, string, string));

        address receivedToken = address(0);
        uint256 receivedAmount = 0;

        if (message.destTokenAmounts.length > 0) {
            receivedToken = message.destTokenAmounts[0].token;
            receivedAmount = message.destTokenAmounts[0].amount;
            IERC20(receivedToken).approve(address(donateLinkMain), receivedAmount);
        }

        donateLinkMain.recordCrossChainDonation(
            donor,
            streamer,
            receivedToken,
            receivedAmount,
            donorName,
            donorMessage,
            chainNames[sourceChain]
        );

        emit CrossChainDonationReceived(
            message.messageId,
            sourceChain,
            donor,
            streamer
        );
    }

    // --- Admin ---
    function allowlistSourceChain(
        uint64 _chainSelector,
        bool _allowed,
        string calldata _name
    ) external onlyOwner {
        allowlistedSourceChains[_chainSelector] = _allowed;
        chainNames[_chainSelector] = _name;
    }

    function setAllowlistedSender(uint64 _chainSelector, address _sender) external onlyOwner {
        allowlistedSenders[_chainSelector] = _sender;
    }

    function setDonateLinkMain(address _main) external onlyOwner {
        donateLinkMain = IDonateLinkMain(_main);
    }
}
