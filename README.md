# Ensemble React

This is a monorepo containing the React elements for Ensemble, built with Turborepo.

## Getting Started

Install `pnpm` with brew:

```sh
brew install pnpm
```

Run the following commands:

```sh
pnpm install
pnpm run build
```

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- `starter`: a React app boostrapped with Create React App, that uses the Ensemble runtime
- `framework`: a low level Typescript and React hooks library that contains the plumbing for Ensemble
- `runtime`: a React library for running an Ensemble App
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Develop

To develop all apps and packages, run the following command:

```sh
pnpm dev
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
