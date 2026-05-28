// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PoolManager} from "../vendor/v4-core/src/PoolManager.sol";

/// @notice Thin wrapper to make Hardhat emit an artifact for PoolManager.
contract V4PoolManager is PoolManager {
    constructor(address initialOwner) PoolManager(initialOwner) {}
}

