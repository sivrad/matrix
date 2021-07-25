<img height="220px" src="https://i.imgur.com/UMHxlIV.png" alt="Matrix Logo" />

# Matrix

The core functionallity of the `matrix-service`.

![npm](https://img.shields.io/npm/v/@sivrad/matrix)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/sivrad/matrix/CI)
[![codecov](https://codecov.io/gh/sivrad/matrix/branch/main/graph/badge.svg?token=UiJ4feXPzs)](https://codecov.io/gh/sivrad/matrix)
![GitHub](https://img.shields.io/github/license/sivrad/matrix)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<hr>

**NOTE**: This documentation assumes you are familiar with the `matrix-service`, if you would like to know more about it, read the [documentation](https://nix2io.github.io/docs/services/matrix).

## Installation

```sh
yarn add @sivrad/matrix
```

## Usage

### Create Matrix Instance

```typescript
// Import Matrix from this package.
import { Matrix } from '@sivrad/matrix';
// Import a simple JSON file driver.
import { JSONDBDriver } from '@sivrad/matrix';

// Create an instance and pass in the driver.
const mtx = new Matrix(new JSONDBDriver('myfile.json'));
```

## Contributing

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
