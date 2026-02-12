// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/DonateLink.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockPriceFeed {
    int256 public price;
    uint8 public decimals_ = 8;

    constructor(int256 _price) {
        price = _price;
    }

    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (0, price, 0, block.timestamp, 0);
    }

    function decimals() external view returns (uint8) {
        return decimals_;
    }
}

contract MockERC20 is IERC20 {
    string public name = "Mock Token";
    string public symbol = "MOCK";
    uint8 public decimals_ = 18;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance_;
    uint256 public totalSupply;

    constructor(string memory _symbol, uint8 _decimals) {
        symbol = _symbol;
        decimals_ = _decimals;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance_[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance_[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return allowance_[owner][spender];
    }
}

contract DonateLinkTest is Test {
    DonateLink public donateLink;
    MockPriceFeed public ethPriceFeed;
    MockPriceFeed public linkPriceFeed;
    MockERC20 public linkToken;
    MockERC20 public usdcToken;

    address public owner = address(this);
    address public feeRecipient = address(0xFEE);
    address public streamer = address(0x1);
    address public donor = address(0x2);
    address public ccipReceiver = address(0x3);

    function setUp() public {
        // ETH = $2000, LINK = $15
        ethPriceFeed = new MockPriceFeed(2000e8);
        linkPriceFeed = new MockPriceFeed(15e8);
        linkToken = new MockERC20("LINK", 18);
        usdcToken = new MockERC20("USDC", 6);

        donateLink = new DonateLink(
            address(ethPriceFeed),
            address(linkPriceFeed),
            address(linkToken),
            feeRecipient
        );

        donateLink.setCCIPReceiver(ccipReceiver);

        // Fund donor
        vm.deal(donor, 100 ether);
        linkToken.mint(donor, 1000e18);
        usdcToken.mint(donor, 10000e6);

        // Register streamer
        vm.prank(streamer);
        donateLink.registerStreamer();
    }

    function test_RegisterStreamer() public {
        address newStreamer = address(0x99);
        vm.prank(newStreamer);
        donateLink.registerStreamer();
        (bool isRegistered,,) = donateLink.streamers(newStreamer);
        assertTrue(isRegistered);
    }

    function test_RevertDoubleRegistration() public {
        vm.prank(streamer);
        vm.expectRevert(DonateLink.AlreadyRegistered.selector);
        donateLink.registerStreamer();
    }

    function test_DonateETH() public {
        uint256 donationAmount = 1 ether;
        uint256 feeRecipientBalBefore = feeRecipient.balance;

        vm.prank(donor);
        donateLink.donate{value: donationAmount}(streamer, "Alice", "Great stream!");

        // 5% fee = 0.05 ETH
        uint256 expectedFee = donationAmount * 500 / 10000;
        uint256 expectedNet = donationAmount - expectedFee;

        assertEq(donateLink.getStreamerBalance(streamer), expectedNet);
        assertEq(feeRecipient.balance - feeRecipientBalBefore, expectedFee);
        assertEq(donateLink.totalDonationsCount(), 1);

        // USD value: 1 ETH * $2000 = $2000 (in 8 decimals)
        assertEq(donateLink.getStreamerTotalDonationsUsd(streamer), 2000e8);
    }

    function test_DonateETH_ZeroAmount() public {
        vm.prank(donor);
        vm.expectRevert(DonateLink.ZeroAmount.selector);
        donateLink.donate{value: 0}(streamer, "Alice", "Hello");
    }

    function test_DonateETH_UnregisteredStreamer() public {
        vm.prank(donor);
        vm.expectRevert(DonateLink.StreamerNotRegistered.selector);
        donateLink.donate{value: 1 ether}(address(0x999), "Alice", "Hello");
    }

    function test_DonateToken() public {
        uint256 amount = 100e18; // 100 LINK

        vm.startPrank(donor);
        linkToken.approve(address(donateLink), amount);
        donateLink.donateToken(streamer, address(linkToken), amount, "Bob", "Keep it up!");
        vm.stopPrank();

        uint256 expectedFee = amount * 500 / 10000;
        uint256 expectedNet = amount - expectedFee;

        assertEq(donateLink.getStreamerTokenBalance(streamer, address(linkToken)), expectedNet);
        assertEq(donateLink.totalDonationsCount(), 1);

        // USD value: 100 LINK * $15 = $1500 (in 8 decimals)
        assertEq(donateLink.getStreamerTotalDonationsUsd(streamer), 1500e8);
    }

    function test_WithdrawETH() public {
        // Donate first
        vm.prank(donor);
        donateLink.donate{value: 1 ether}(streamer, "Alice", "Tip");

        uint256 balance = donateLink.getStreamerBalance(streamer);
        uint256 streamerBalBefore = streamer.balance;

        vm.prank(streamer);
        donateLink.withdrawETH();

        assertEq(donateLink.getStreamerBalance(streamer), 0);
        assertEq(streamer.balance - streamerBalBefore, balance);
    }

    function test_WithdrawToken() public {
        uint256 amount = 100e18;

        vm.startPrank(donor);
        linkToken.approve(address(donateLink), amount);
        donateLink.donateToken(streamer, address(linkToken), amount, "Bob", "Here");
        vm.stopPrank();

        uint256 tokenBalance = donateLink.getStreamerTokenBalance(streamer, address(linkToken));

        vm.prank(streamer);
        donateLink.withdrawToken(address(linkToken));

        assertEq(donateLink.getStreamerTokenBalance(streamer, address(linkToken)), 0);
        assertEq(linkToken.balanceOf(streamer), tokenBalance);
    }

    function test_OnlyRegisteredCanWithdraw() public {
        vm.prank(donor);
        vm.expectRevert(DonateLink.NotRegistered.selector);
        donateLink.withdrawETH();
    }

    function test_WithdrawNoBalance() public {
        vm.prank(streamer);
        vm.expectRevert(DonateLink.NoBalance.selector);
        donateLink.withdrawETH();
    }

    function test_CrossChainDonation() public {
        uint256 amount = 100e18;
        linkToken.mint(ccipReceiver, amount);

        vm.startPrank(ccipReceiver);
        linkToken.approve(address(donateLink), amount);
        donateLink.recordCrossChainDonation(
            donor, streamer, address(linkToken), amount,
            "CrossDonor", "From Ethereum", "ethereum"
        );
        vm.stopPrank();

        uint256 expectedFee = amount * 500 / 10000;
        uint256 expectedNet = amount - expectedFee;

        assertEq(donateLink.getStreamerTokenBalance(streamer, address(linkToken)), expectedNet);
        assertEq(donateLink.totalDonationsCount(), 1);
    }

    function test_OnlyCCIPReceiverCanRecord() public {
        vm.prank(donor);
        vm.expectRevert(DonateLink.OnlyCCIPReceiver.selector);
        donateLink.recordCrossChainDonation(
            donor, streamer, address(0), 1 ether,
            "Hacker", "Evil", "ethereum"
        );
    }

    function test_PlatformFeeUpdate() public {
        donateLink.setPlatformFee(300); // 3%
        assertEq(donateLink.platformFeeBps(), 300);
    }

    function test_PlatformFeeTooHigh() public {
        vm.expectRevert(DonateLink.FeeTooHigh.selector);
        donateLink.setPlatformFee(1001); // > 10%
    }

    function test_GetLatestPrice() public view {
        int256 ethPrice = donateLink.getLatestPrice(address(0));
        assertEq(ethPrice, 2000e8);

        int256 linkPrice = donateLink.getLatestPrice(address(linkToken));
        assertEq(linkPrice, 15e8);
    }

    function test_UsdcDonation_NoFeed() public {
        // USDC has no price feed, should be treated as 1:1 stablecoin
        uint256 amount = 100e6; // 100 USDC (6 decimals)

        vm.startPrank(donor);
        usdcToken.approve(address(donateLink), amount);
        donateLink.donateToken(streamer, address(usdcToken), amount, "USDCDonor", "Stablecoin");
        vm.stopPrank();

        // USD value: 100 USDC → 100 USD (in 8 decimals)
        assertEq(donateLink.getStreamerTotalDonationsUsd(streamer), 100e8);
    }
}
