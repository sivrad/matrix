<p align="center"><img height="220px" src="https://i.imgur.com/UMHxlIV.png" alt="Matrix Logo" /><p>

<p align="center">
  <strong>Matrix</strong><br />
  <sub>An opinionated schema-based database interface for the modern world.</sub>
</p>

<p align="center">
  [ <a href="#installation">Installation 💾</a> | <a href="#usage">Usage 🤓</a> | <a href="https://www.npmjs.com/package/@sivrad/PACKAGE_NAME">NPM 📦</a> | <a href="https://github.com/sivrad/readme-template">Github 🕸</a> ]
</p>

[![codecov](https://codecov.io/gh/sivrad/matrix/branch/main/graph/badge.svg?token=UiJ4feXPzs)](https://codecov.io/gh/sivrad/matrix)

# Installation

```sh
yarn add @sivrad/matrix
```

# Usage

## Create Matrix Instance

```typescript
// Import Matrix from this package.
import { Matrix } from '@sivrad/matrix';

// Create an instance and pass all the collections.
const mtx = new Matrix([exampleCollection]);
```

## Get Collection

```typescript
console.log(mtx.getCollection('example'));
```

## Get a Type

```typescript
console.log(mtx.getType('example.ExampleThing'));
```

The rest of this is meant to be used by generated code with the [`collection-tools`](https://github.com/sivrad/matrix-collection-tools) package.

# Contributing

These are the steps to contribute to the Matrix Package.

## Post Git Clone

### Install Dependencies

Install node dependencies with yarn.

```sh
yarn
```

### Generate Internal Types

This generates internal types from the JSON schemas from [this](https://github.com/sivrad/matrix-schema) repo.

```sh
yarn generate-types
```

## Building the Package

This script will build the package and transpile the code to Javascript.

```sh
yarn build
```

Additionally, you can just build the `src/types/*` files with:

```sh
yarn build-types
```

This is usefull if you don't want to transpile into Javascript every time you change something.
