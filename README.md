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

## Complete Feature List

### Supported Asset Types

The Asset Tokenization Kit supports a wide range of digital assets, each with
specialized features:

1. **StableCoins**

   - Fully collateralized digital currencies backed by real-world assets
   - Designed for stable value maintenance and secure transactions
   - Ideal for cross-border settlements, treasury management, and supply chain
     finance

2. **Bonds**

   - Digital representation of traditional fixed-income securities
   - Features include maturity dates, yield distribution, and redemption
     mechanisms
   - Perfect for institutional investments and treasury optimization

3. **Equity Tokens**

   - Digital shares with voting rights and governance capabilities
   - Support for different equity classes and categories (Common, Preferred,
     Series A, etc.)
   - Streamlines shareholder management and corporate governance

4. **Investment Funds**

   - Digital fund shares with automated fee management
   - Supports various fund types (Hedge Funds, Mutual Funds, etc.)
   - Simplifies fund administration and investor participation

5. **Tokenized Deposits**

   - Digital representation of traditional banking deposits
   - Enhanced with compliance features like allowlisting
   - Streamlines interbank settlements and deposit management

6. **Cryptocurrency**

   - Custom cryptocurrency token creation and management
   - Configurable tokenomics and distribution mechanisms
   - Supports various use cases from loyalty programs to utility tokens

7. **Fixed Yield Assets**
   - Digital assets with predetermined yield returns
   - Automated distribution of yields to token holders
   - Ideal for structured financial products

### Platform Features

#### User Interface & Experience

- **Intuitive Dashboard** - Comprehensive overview of all tokenized assets,
  transactions, and platform activities
- **Asset Management Interface** - Create, issue, transfer, and manage digital
  assets through a user-friendly interface
- **Portfolio Management** - Track holdings, transaction history, and asset
  performance
- **Activity Monitoring** - Real-time tracking of all on-chain activities and
  transactions
- **Multi-language Support** - Interface available in multiple languages
  including English, Arabic, German, and Japanese

#### Asset Management

- **Token Creation Wizard** - Step-by-step process to create and deploy new
  tokenized assets
- **Asset Issuance Controls** - Secure mechanisms for minting and distributing
  tokens
- **Transfer Management** - Initiate, approve, and track token transfers
- **Holder Management** - View and manage token holders with detailed
  information
- **Underlying Asset Tracking** - Monitor and manage the real-world assets
  backing digital tokens

#### Security & Compliance

- **Role-Based Access Control** - Granular permission management for different
  user roles:
  - Supply Management - Control token issuance and supply
  - User Management - Manage user permissions and restrictions
  - Administrator - Overall platform governance and emergency controls
- **Compliance Tools**:
  - Blocklist/Allowlist Functionality - Restrict or permit specific users
  - Pause Mechanisms - Temporarily halt operations during emergencies
  - KYC/AML Integration Capabilities - Connect with identity verification
    systems
- **Custodial Support** - Institutional-grade custody solutions for digital
  assets

#### Technical Features

- **Smart Contract Templates** - Pre-built, audited contract templates for
  various asset types
- **Meta-Transaction Support** - Gas-free transactions for improved user
  experience
- **Customizable Code** - Fully open-source and customizable for specific
  business needs
- **Multi-chain Compatibility** - Deploy on various blockchain networks
- **Subgraph Integration** - Efficient indexing and querying of blockchain data
- **Comprehensive REST API** - Complete coverage of all actions and data
  retrieval via REST api's
- **Exports** - Filterable, sortable CSV exports of all data and logs

#### Platform Administration

- **User Management** - Add, remove, and manage platform users
- **Platform Settings** - Configure and customize platform behavior
- **Branding Customization** - Adapt the interface to match your brand identity

## Overcoming the Blockchain Challenges

Developing a digital asset platform involves multiple complex steps, from smart
contract deployment to frontend integration and compliance considerations. While
blockchain offers transparency and security, creating and managing tokenized
assets requires deep expertise in smart contract development, wallet
integrations, and transaction management.

The SettleMint Asset Tokenization Kit eliminates these complexities by providing
ready-to-use smart contract templates, a pre-built dApp web UI, and
easy-to-configure integrations. This allows businesses, banks, and financial
institutions to quickly launch digital assets, ensuring a faster go-to-market,
compliance readiness, and seamless user experiences.

## Getting Started

There are two ways to use this kit:

1. **Predeployed Setup** - Using pre-deployed contracts (fastest)
2. **Customized Setup** - Deploy your own contracts

### Predeployed Setup (Fastest)

This is the fastest way to get started with the kit. It uses pre-deployed
contracts, subgraphs, and ABIs.

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

Browse to http://localhost:3000 to access the application. Create an account by
clicking "Sign up" - the first account created will have admin privileges.

### Customized Setup

If you want to deploy and use your customised contracts, subgraph, and ABIs,
follow these steps:

#### Prerequisites

1. Forge v0.3.0 - Install the latest Foundry from
   [https://book.getfoundry.sh/getting-started/installation](https://book.getfoundry.sh/getting-started/installation)
2. Node.js version >=20.18.1 - Required for The Graph CLI. We recommend using
   [fnm](https://github.com/Schniz/fnm) for Node.js installation.

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

Browse to http://localhost:3000 to access the application. Create an account by
clicking "Sign up" - the first account created will have admin privileges.
