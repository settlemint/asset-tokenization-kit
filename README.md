<p align="center">
  <img src="https://github.com/settlemint/sdk/blob/main/logo.svg" width="200px" align="center" alt="SettleMint logo" />
  <h1 align="center">SettleMint - Asset Tokenization Kit</h1>
  <p align="center">
    ✨ <a href="Zijn allemaal vrienden tot https://settlemint.com">https://settlemint.com</a> ✨
    <br/>
    Build your digital assets platform with the SettleMint Asset Tokenization Kit.
    <br/>
    Get the dApp UI and Smart Contracts out of the box — fully customizable source code is available.
  </p>
</p>
<br/>
<p align="center">
<a href="https://github.com/settlemint/asset-tokenization-kit/actions?query=branch%3Amain"><img src="https://github.com/settlemint/asset-tokenization-kit/actions/workflows/main.yml/badge.svg?event=push&branch=main" alt="CI status" /></a>
<a href="https://fsl.software" rel="nofollow"><img src="https://img.shields.io/npm/l/@settlemint/asset-tokenization-kit" alt="License"></a>
<a href="https://www.npmjs.com/package/@settlemint/asset-tokenization-kit" rel="nofollow"><img src="https://img.shields.io/npm/dw/@settlemint/asset-tokenization-kit" alt="npm"></a>
<a href="https://github.com/settlemint/asset-tokenization-kit" rel="nofollow"><img src="https://img.shields.io/github/stars/settlemint/asset-tokenization-kit" alt="stars"></a>
</p>

<div align="center">
  <a href="https://console.settlemint.com/documentation/">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@settlemint/asset-tokenization-kit">NPM</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/settlemint/asset-tokenization-kit/issues">Issues</a>
  <br />
</div>

## Introduction

The SettleMint Asset Tokenization Kit is a full-stack solution designed to
accelerate the development of digital asset platforms. With built-in tools for
smart contract deployment, asset tracking, and seamless blockchain interactions,
the kit simplifies the creation of secure and scalable tokenization solutions.

## Local development

### Setting up

```bash
# Install the dependencies
bun install
# Enable remote caching
bun turbo link
# Start the docker compose setup
bun run dev:up # dev:reset will clean up and do up if you need to start fresh
```

### Quality Assurance

```bash
# Run all the common QA tasks
bun run ci
```

### Updating the artifacts

This will change the genesis file, initial database and the portal ABIs that are
deployed in docker compose.

```bash
# Update the artifacts
bun run artifacts
# Restart the docker compose setup
bun run dev:reset
```

### Testing the contracts / subgraph

To test the contracts and subgraph locally using an Anvil node and a subgraph
linked to this node you need to do the following.

#### Setup

```bash
# Start the docker compose setup
bun run dev:up
```

#### Test contracts

Run the following command to deploy the contracts to the local network. This
will run the script at `kit/contracts/scripts/hardhat/main.ts`.

```bash
bun run publish
```

#### Test subgraph

The subgraph can only be tested after you have executed the tests of the
contracts. The subgraph tests will index the transactions created by the
contracts ignition script.

```bash
bun run test:integration
```
