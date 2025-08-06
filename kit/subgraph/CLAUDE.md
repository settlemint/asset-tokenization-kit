# Subgraph Module

## Stack

TheGraph v0.38.1 | AssemblyScript (NOT TypeScript) | GraphQL

## Key Commands

```bash
bun run codegen   # Generate AS types
bun run compile   # Build + IPFS hash
bun run publish   # Deploy local
```

## Critical: AssemblyScript ≠ TypeScript

<example>
# CORRECT AssemblyScript
let token = Token.load(id)
if (token == null) {
  token = new Token(id)
}
token.save()

# WRONG (TypeScript syntax)

const token = await Token.load(id) # NO async token?.update() # NO optional
chaining [...array, item] # NO spread </example>

<example>
# Array Handling
let array = entity.field
if (array == null) {
  array = new Array<string>()
}
array.push(item)
entity.field = array  # Must reassign
</example>

## Event Handler Pattern

<example>
export function handleTransfer(event: Transfer): void {
  let token = Token.load(event.address.toHex())
  if (token == null) return
  
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let transfer = new TransferEvent(id)
  
  updateBalance(from, value.neg())
  updateBalance(to, value)
  
  transfer.save()
  token.save()
}
</example>

## Common Issues

- Using TypeScript syntax → AssemblyScript only
- Missing .save() → always save entities
- Null derefs → check with == null
- Array mutations → reassign after changes
- ID collisions → use composite IDs (token-account)
