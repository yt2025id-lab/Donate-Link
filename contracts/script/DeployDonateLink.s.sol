// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/DonateLink.sol";
import "../src/DonateLinkCCIPReceiver.sol";
import "../src/DonateLinkAutomation.sol";

contract DeployDonateLink is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address ethUsdFeed = vm.envAddress("ETH_USD_PRICE_FEED");
        address linkUsdFeed = vm.envAddress("LINK_USD_PRICE_FEED");
        address linkToken = vm.envAddress("LINK_TOKEN");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        address ccipRouter = vm.envAddress("CCIP_ROUTER_BASE_SEPOLIA");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy main contract
        DonateLink donateLink = new DonateLink(
            ethUsdFeed, linkUsdFeed, linkToken, feeRecipient
        );
        console.log("DonateLink deployed at:", address(donateLink));

        // 2. Deploy CCIP Receiver
        DonateLinkCCIPReceiver receiver = new DonateLinkCCIPReceiver(
            ccipRouter, address(donateLink)
        );
        console.log("CCIPReceiver deployed at:", address(receiver));

        // 3. Link CCIP Receiver to main contract
        donateLink.setCCIPReceiver(address(receiver));

        // 4. Deploy Automation contract
        DonateLinkAutomation automation = new DonateLinkAutomation(address(donateLink));
        console.log("Automation deployed at:", address(automation));

        vm.stopBroadcast();
    }
}
