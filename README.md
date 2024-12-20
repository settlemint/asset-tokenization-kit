<p align="center">
  <img src="https://github.com/settlemint/sdk/blob/main/logo.svg" width="200px" align="center" alt="SettleMint logo" />
  <h1 align="center">SettleMint Starterkit - Asset Tokenization</h1>
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

## Getting started

```bash
bun install
bun settlemint login
bun settlemint connect
cd kit/contracts
bun run prod:deploy

# TODO: Here i need a way to push the ABI's to the portal

cd ../subgraph
bun prod:deploy -- 47561  # change this id based on the network id & enter a name for your subgraph
cd ../../
bun settlemint connect # updates the list of subgraphs (not fun to do it twice)
cd kit/dapp
bun codegen
bun db:push # updates the db in hasura

# TODO: Instead of doing that first signup is an admin thing, maybe we should have a CLI to create an admin account

bun dev
```

Then browse to http://localhost:3000/admin and you should see the sign-in page. Press sign up and create an account.
If yours is the first account, you will be an admin.

