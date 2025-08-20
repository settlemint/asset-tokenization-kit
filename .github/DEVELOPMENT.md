# Development

After
[forking the repo from GitHub](https://help.github.com/articles/fork-a-repo) and
[installing pnpm](https://pnpm.io/installation):

```shell
git clone https://github.com/ < your-name-here > /sdk
cd sdk
bun install
```

> This repository includes a list of suggested VS Code extensions. It's a good
> idea to use [VS Code](https://code.visualstudio.com) or
> [Cursor](https://cursor.com) and accept its suggestion to install them, as
> they'll help with development.

## Building

Run `bun pkg:build` to build the source files from `src/` into output files in
`dist/`:

```shell
bun pkg:build
```

Run `bun pkg:dev` to run the builder in a watch mode that continuously cleans
and recreates `dist/` as you save files:

```shell
bun pkg:dev
```

## Testing

[Vitest](https://vitest.dev) is used for tests. You can run it locally on the
command-line:

```shell
bun pkg:test
```

Use the `pkg:test:coverage` flag to compute test coverage and place reports in
the `coverage/` directory:

```shell
bun pkg:test:coverage
```
