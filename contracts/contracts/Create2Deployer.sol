// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal CREATE2 deployer used to deterministically deploy v4 hooks
///         at addresses whose low bits encode hook permissions.
contract Create2Deployer {
    event Deployed(address indexed addr, bytes32 indexed salt);

    function deploy(bytes32 salt, bytes memory initCode) external returns (address addr) {
        require(initCode.length != 0, "Empty initCode");
        assembly ("memory-safe") {
            addr := create2(0, add(initCode, 0x20), mload(initCode), salt)
        }
        require(addr != address(0), "CREATE2 failed");
        emit Deployed(addr, salt);
    }
}

