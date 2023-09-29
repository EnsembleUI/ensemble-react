# Ensemble React

This is a monorepo containing the React elements for Ensemble, built with Turborepo.

## Getting Started

Clone the repo and then cd into the root directory of the repo.

Activate `pnpm` with node's corepack:

```sh
corepack prepare pnpm@6.32.2 --activate
```

[pnpm docs](https://pnpm.io/installation#using-corepack)

Run the following commands:

```sh
pnpm install
pnpm build
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

### How to run the starter app

```sh
cd starter
pnpm install
pnpm start
```

This command will start the development server, and it should automatically open your default web browser displaying the app. If it doesn't, you can manually navigate to http://localhost:3000 in your browser.

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
