<p align="center">
  <img src="https://github.com/settlemint/sdk/blob/main/logo.svg" width="200px" align="center" alt="SettleMint logo" />
  <h1 align="center">SettleMint - Asset Tokenization Kit</h1>
  <p align="center">
    ✨ <a href="https://settlemint.com">https://settlemint.com</a> ✨
    <br/>
    Integrate SettleMint into your application with ease.
  </p>
</p>
<br/>
<p align="center">
<a href="https://github.com/settlemint/starterkit-asset-tokenization/actions?query=branch%3Amain"><img src="https://github.com/settlemint/starterkit-asset-tokenization/actions/workflows/ci.yml/badge.svg?event=push&branch=main" alt="CI status" /></a>
<a href="https://fsl.software" rel="nofollow"><img src="https://img.shields.io/npm/l/@settlemint/starterkit-asset-tokenization" alt="License"></a>
<a href="https://www.npmjs.com/package/@settlemint/starterkit-asset-tokenization" rel="nofollow"><img src="https://img.shields.io/npm/dw/@settlemint/starterkit-asset-tokenization" alt="npm"></a>
<a href="https://github.com/settlemint/starterkit-asset-tokenization" rel="nofollow"><img src="https://img.shields.io/github/stars/settlemint/starterkit-asset-tokenization" alt="stars"></a>
</p>

<div align="center">
  <a href="https://console.settlemint.com/documentation/">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@settlemint/starterkit-asset-tokenization">NPM</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/settlemint/starterkit-asset-tokenization/issues">Issues</a>
  <br />
</div>

## Getting Started

There are two ways to use this starterkit:

1. **Predeployed Setup** - Using pre-deployed contracts (fastest)
2. **Customized Setup** - Deploy your own contracts

### Predeployed Setup (Fastest)

This is the fastest way to get started with the starterkit. It uses pre-deployed contracts, subgraphs, and ABIs.

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

### Known Limitations & TODOs

- No CLI command to update ABIs automatically
- Admin account creation relies on first-signup mechanism, perhaps a dedicated CLI command?
