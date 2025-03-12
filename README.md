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

The SettleMint Asset Tokenization Kit is a full-stack solution designed to accelerate the development of digital asset platforms. With built-in tools for smart contract deployment, asset tracking, and seamless blockchain interactions, the kit simplifies the creation of secure and scalable tokenization solutions.

### Key Features

- **Ready-to-use ERC20 smart contract templates** - Pre-built templates make it easy to issue, manage, and transfer tokenized assets such as stablecoins, bonds, securities, and real-world assets (RWAs).

- **Pre-built dApp web UI** - The kit's low-code approach and ready-to-use dApp web UI streamline the deployment process, reducing time-to-market and ensuring compliance with regulatory frameworks.

- **Easy Management** - Includes detailed dashboards and advanced analytics, providing real-time insights into tokenized assets, transactions, and user activity. Track token issuance, transfers, holdings, and on-chain interactions through an intuitive interface.

- **Fully Customizable Code** - Our opensource dApp templates enable further customizations of the application for your branding, look and feel. You can add more features and integrations and still deploy in minutes.

## Overcoming the Blockchain Challenges

Developing a digital asset platform involves multiple complex steps, from smart contract deployment to frontend integration and compliance considerations. While blockchain offers transparency and security, creating and managing tokenized assets requires deep expertise in smart contract development, wallet integrations, and transaction management.

The SettleMint Asset Tokenization Kit eliminates these complexities by providing ready-to-use smart contract templates, a pre-built dApp web UI, and easy-to-configure integrations. This allows businesses, banks, and financial institutions to quickly launch digital assets, ensuring a faster go-to-market, compliance readiness, and seamless user experiences.

## Getting Started

There are two ways to use this kit:

1. **Predeployed Setup** - Using pre-deployed contracts (fastest)
2. **Customized Setup** - Deploy your own contracts

### Predeployed Setup (Fastest)

This is the fastest way to get started with the kit. It uses pre-deployed contracts, subgraphs, and ABIs.

```bash
# Install dependencies
bun install

# Login and connect to SettleMint
bunx settlemint login
bunx settlemint connect

# Generate types and start development server
cd kit/dapp
bun codegen:settlemint
bun addresses
bun dev
```

Browse to http://localhost:3000 to access the application. Create an account by clicking "Sign up" - the first account created will have admin privileges.

### Customized Setup

If you want to deploy and use your customised contracts, subgraph, and ABIs, follow these steps:

#### Prerequisites

1. Forge v0.3.0 - Install the latest Foundry from [https://book.getfoundry.sh/getting-started/installation](https://book.getfoundry.sh/getting-started/installation)
2. Node.js version >=20.18.1 - Required for The Graph CLI. We recommend using [fnm](https://github.com/Schniz/fnm) for Node.js installation.

#### Deployment Steps

```bash
# Install dependencies
bun install

# Login and connect to SettleMint
bun settlemint login
bun settlemint connect

# Deploy contracts
cd kit/contracts
bun deploy:remote

# Deploy subgraph
cd ../subgraph
bun deploy:remote
cd ../../

# Codegen
bun codegen

# Setup dapp
cd kit/dapp
bun addresses
bun db:push

# Start development server
bun dev
```

Browse to http://localhost:3000 to access the application. Create an account by clicking "Sign up" - the first account created will have admin privileges.
