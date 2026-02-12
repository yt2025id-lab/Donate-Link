// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/DonateLinkCCIPSender.sol";

contract DeployCCIPSender is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address router = vm.envAddress("CCIP_ROUTER");
        uint64 destChainSelector = uint64(vm.envUint("DEST_CHAIN_SELECTOR"));
        address destReceiver = vm.envAddress("DEST_CCIP_RECEIVER");

        vm.startBroadcast(deployerPrivateKey);

        DonateLinkCCIPSender sender = new DonateLinkCCIPSender(
            router, destChainSelector, destReceiver
        );
        console.log("CCIPSender deployed at:", address(sender));

        vm.stopBroadcast();
    }
}
