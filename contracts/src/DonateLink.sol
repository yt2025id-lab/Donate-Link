// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DonateLink is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- Structs ---
    struct StreamerInfo {
        bool isRegistered;
        uint256 totalDonationsUsd; // 8 decimals (matching Chainlink price feed)
        uint256 ethBalance;
    }

    // --- State ---
    uint256 public platformFeeBps = 500; // 5% = 500 basis points
    address public feeRecipient;
    address public ccipReceiver;

    mapping(address => StreamerInfo) public streamers;
    mapping(address => mapping(address => uint256)) public streamerTokenBalances; // streamer => token => balance
    mapping(address => AggregatorV3Interface) public priceFeeds; // token => priceFeed (address(0) = ETH)

    uint256 public totalDonationsCount;

    // --- Events ---
    event DonationReceived(
        address indexed donor,
        address indexed streamer,
        string donorName,
        string message,
        uint256 amountUsd,
        uint256 amountToken,
        address tokenAddress,
        string sourceChain,
        uint256 timestamp
    );
    event StreamerRegistered(address indexed streamer);
    event Withdrawal(address indexed streamer, address token, uint256 amount);
    event PlatformFeeUpdated(uint256 newFeeBps);

    // --- Errors ---
    error NotRegistered();
    error AlreadyRegistered();
    error OnlyCCIPReceiver();
    error ZeroAmount();
    error StreamerNotRegistered();
    error NoBalance();
    error TransferFailed();
    error FeeTooHigh();
    error InvalidPrice();

    // --- Modifiers ---
    modifier onlyRegistered() {
        if (!streamers[msg.sender].isRegistered) revert NotRegistered();
        _;
    }

    modifier onlyCCIPReceiverRole() {
        if (msg.sender != ccipReceiver) revert OnlyCCIPReceiver();
        _;
    }

    // --- Constructor ---
    constructor(
        address _ethUsdPriceFeed,
        address _linkUsdPriceFeed,
        address _linkToken,
        address _feeRecipient
    ) Ownable(msg.sender) {
        priceFeeds[address(0)] = AggregatorV3Interface(_ethUsdPriceFeed);
        if (_linkToken != address(0) && _linkUsdPriceFeed != address(0)) {
            priceFeeds[_linkToken] = AggregatorV3Interface(_linkUsdPriceFeed);
        }
        feeRecipient = _feeRecipient;
    }

    // --- Registration ---
    function registerStreamer() external {
        if (streamers[msg.sender].isRegistered) revert AlreadyRegistered();
        streamers[msg.sender].isRegistered = true;
        emit StreamerRegistered(msg.sender);
    }

    // --- Direct ETH Donation ---
    function donate(
        address _streamer,
        string calldata _donorName,
        string calldata _message
    ) external payable nonReentrant {
        if (!streamers[_streamer].isRegistered) revert StreamerNotRegistered();
        if (msg.value == 0) revert ZeroAmount();

        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 netAmount = msg.value - fee;

        (bool feeSent,) = feeRecipient.call{value: fee}("");
        if (!feeSent) revert TransferFailed();

        streamers[_streamer].ethBalance += netAmount;

        uint256 usdValue = getUsdValue(address(0), msg.value);
        streamers[_streamer].totalDonationsUsd += usdValue;
        totalDonationsCount++;

        emit DonationReceived(
            msg.sender, _streamer, _donorName, _message,
            usdValue, msg.value, address(0), "base", block.timestamp
        );
    }

    // --- Token Donation (USDC, LINK) ---
    function donateToken(
        address _streamer,
        address _token,
        uint256 _amount,
        string calldata _donorName,
        string calldata _message
    ) external nonReentrant {
        if (!streamers[_streamer].isRegistered) revert StreamerNotRegistered();
        if (_amount == 0) revert ZeroAmount();

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 fee = (_amount * platformFeeBps) / 10000;
        uint256 netAmount = _amount - fee;

        IERC20(_token).safeTransfer(feeRecipient, fee);

        streamerTokenBalances[_streamer][_token] += netAmount;

        uint256 usdValue = getUsdValue(_token, _amount);
        streamers[_streamer].totalDonationsUsd += usdValue;
        totalDonationsCount++;

        emit DonationReceived(
            msg.sender, _streamer, _donorName, _message,
            usdValue, _amount, _token, "base", block.timestamp
        );
    }

    // --- Cross-Chain Donation (called by CCIP Receiver) ---
    function recordCrossChainDonation(
        address _donor,
        address _streamer,
        address _token,
        uint256 _amount,
        string calldata _donorName,
        string calldata _message,
        string calldata _sourceChain
    ) external onlyCCIPReceiverRole nonReentrant {
        if (!streamers[_streamer].isRegistered) revert StreamerNotRegistered();

        uint256 fee = (_amount * platformFeeBps) / 10000;
        uint256 netAmount = _amount - fee;

        if (_token == address(0)) {
            streamers[_streamer].ethBalance += netAmount;
        } else {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
            IERC20(_token).safeTransfer(feeRecipient, fee);
            streamerTokenBalances[_streamer][_token] += netAmount;
        }

        uint256 usdValue = getUsdValue(_token, _amount);
        streamers[_streamer].totalDonationsUsd += usdValue;
        totalDonationsCount++;

        emit DonationReceived(
            _donor, _streamer, _donorName, _message,
            usdValue, _amount, _token, _sourceChain, block.timestamp
        );
    }

    // --- Withdrawal ---
    function withdrawETH() external onlyRegistered nonReentrant {
        uint256 balance = streamers[msg.sender].ethBalance;
        if (balance == 0) revert NoBalance();
        streamers[msg.sender].ethBalance = 0;
        (bool sent,) = msg.sender.call{value: balance}("");
        if (!sent) revert TransferFailed();
        emit Withdrawal(msg.sender, address(0), balance);
    }

    function withdrawToken(address _token) external onlyRegistered nonReentrant {
        uint256 balance = streamerTokenBalances[msg.sender][_token];
        if (balance == 0) revert NoBalance();
        streamerTokenBalances[msg.sender][_token] = 0;
        IERC20(_token).safeTransfer(msg.sender, balance);
        emit Withdrawal(msg.sender, _token, balance);
    }

    // --- Price Feed ---
    function getUsdValue(address _token, uint256 _amount) public view returns (uint256) {
        if (address(priceFeeds[_token]) == address(0)) {
            // No price feed → assume stablecoin 1:1. USDC has 6 decimals, return in 8.
            return (_amount * 1e8) / 1e6;
        }
        (, int256 price,,,) = priceFeeds[_token].latestRoundData();
        if (price <= 0) revert InvalidPrice();

        // ETH/LINK: 18 decimals amount, 8 decimals price → 8 decimals result
        if (_token == address(0)) {
            return (_amount * uint256(price)) / 1e18;
        }
        return (_amount * uint256(price)) / 1e18;
    }

    function getLatestPrice(address _token) external view returns (int256) {
        if (address(priceFeeds[_token]) == address(0)) revert InvalidPrice();
        (, int256 price,,,) = priceFeeds[_token].latestRoundData();
        return price;
    }

    // --- Admin ---
    function setCCIPReceiver(address _ccipReceiver) external onlyOwner {
        ccipReceiver = _ccipReceiver;
    }

    function setPlatformFee(uint256 _feeBps) external onlyOwner {
        if (_feeBps > 1000) revert FeeTooHigh();
        platformFeeBps = _feeBps;
        emit PlatformFeeUpdated(_feeBps);
    }

    function setPriceFeed(address _token, address _priceFeed) external onlyOwner {
        priceFeeds[_token] = AggregatorV3Interface(_priceFeed);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    // --- View ---
    function getStreamerBalance(address _streamer) external view returns (uint256 ethBal) {
        return streamers[_streamer].ethBalance;
    }

    function getStreamerTokenBalance(address _streamer, address _token) external view returns (uint256) {
        return streamerTokenBalances[_streamer][_token];
    }

    function getStreamerTotalDonationsUsd(address _streamer) external view returns (uint256) {
        return streamers[_streamer].totalDonationsUsd;
    }

    receive() external payable {}
}
