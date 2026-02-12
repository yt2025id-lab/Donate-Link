// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DonateLinkCCIPSender is Ownable {
    using SafeERC20 for IERC20;

    IRouterClient public router;
    uint64 public destinationChainSelector;
    address public destinationReceiver;

    event CrossChainDonationSent(
        bytes32 indexed messageId,
        address indexed donor,
        address indexed streamer,
        address token,
        uint256 amount
    );

    error InsufficientFee(uint256 required, uint256 provided);
    error RefundFailed();

    constructor(
        address _router,
        uint64 _destinationChainSelector,
        address _destinationReceiver
    ) Ownable(msg.sender) {
        router = IRouterClient(_router);
        destinationChainSelector = _destinationChainSelector;
        destinationReceiver = _destinationReceiver;
    }

    function donateCrossChain(
        address _streamer,
        address _token,
        uint256 _amount,
        string calldata _donorName,
        string calldata _message
    ) external payable returns (bytes32 messageId) {
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(_token).approve(address(router), _amount);

        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});

        bytes memory data = abi.encode(msg.sender, _streamer, _donorName, _message);

        Client.EVM2AnyMessage memory ccipMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationReceiver),
            data: data,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 500_000})),
            feeToken: address(0) // pay in native token
        });

        uint256 fees = router.getFee(destinationChainSelector, ccipMessage);
        if (msg.value < fees) revert InsufficientFee(fees, msg.value);

        messageId = router.ccipSend{value: fees}(destinationChainSelector, ccipMessage);

        if (msg.value > fees) {
            (bool sent,) = msg.sender.call{value: msg.value - fees}("");
            if (!sent) revert RefundFailed();
        }

        emit CrossChainDonationSent(messageId, msg.sender, _streamer, _token, _amount);
    }

    function estimateFee(
        address _token,
        uint256 _amount,
        string calldata _donorName,
        string calldata _message
    ) external view returns (uint256) {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});

        bytes memory data = abi.encode(msg.sender, address(0), _donorName, _message);

        Client.EVM2AnyMessage memory ccipMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationReceiver),
            data: data,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 500_000})),
            feeToken: address(0)
        });

        return router.getFee(destinationChainSelector, ccipMessage);
    }

    // --- Admin ---
    function setDestination(uint64 _chainSelector, address _receiver) external onlyOwner {
        destinationChainSelector = _chainSelector;
        destinationReceiver = _receiver;
    }

    receive() external payable {}
}
