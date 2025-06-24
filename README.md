<p align="center">
  <img src="https://github.com/settlemint/sdk/blob/main/logo.svg" width="200px" align="center" alt="SettleMint logo" />
  <h1 align="center">SettleMint - Asset Tokenization Kit</h1>
  <p align="center">
    ✨ <a href="https://settlemint.com">https://settlemint.com</a> ✨
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

**Note**: The `dapp-v1` folder is deprecated and no longer used. All development
should focus on the modern stack in `kit/dapp`.

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

The project uses a comprehensive QA suite to ensure code quality and
functionality. The main command to run before creating a PR is:

```bash
# Run the complete QA suite
bun run ci
```

This command (`bun run ci`) executes the following tasks in order:

1. **Format Check** (`bun run format`)
   - Validates code formatting using Prettier
   - Ensures consistent code style across the project

2. **Compilation** (`bun run compile`)
   - Compiles smart contracts using Foundry and Hardhat
   - Generates TypeScript types from contracts
   - Validates contract syntax and dependencies

3. **Code Generation** (`bun run codegen`)
   - Generates GraphQL types from schemas
   - Creates TypeScript bindings for smart contracts
   - Updates SDK types for Portal, TheGraph, and Hasura

4. **Linting** (`bun run lint`)
   - Runs ESLint on TypeScript/JavaScript code
   - Checks for code quality issues and potential bugs
   - Enforces coding standards and best practices

5. **Testing** (`bun run test`)
   - Runs unit tests for smart contracts (Foundry)
   - Executes component tests for the dApp
   - Validates business logic and edge cases

### Generating the artifacts

This will change the genesis file, initial database and the portal ABIs that are
deployed in docker compose.

```bash
# Update the artifacts
bun run artifacts
# Start the docker compose setup
bun run dev:up
# OR restart the docker compose setup
bun run dev:reset
```

### Running the dApp locally

```bash
# Start the docker compose setup
bun run dev:up
# Start the dApp in development mode
bun run dev
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
bunx turbo contracts#publish
```

#### Test subgraph

```bash
THE_GRAPH_PORT_LOCAL_DEPLOY=8120 THE_GRAPH_PORT_LOCAL_QUERY=8100 bunx turbo subgraph#test:integration
```
