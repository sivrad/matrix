<p align="center"><img height="220px" src="https://avatars.githubusercontent.com/u/76859002?s=200&v=4" alt="Logo" /><p>

<p align="center">
  <strong>Matrix</strong><br />
  <sub>An opinionated schema-based database interface for the modern world.</sub>
</p>

<p align="center">
  [ <a href="#installation">Installation 💾</a> | <a href="#usage">Usage 🤓</a> | <a href="https://www.npmjs.com/package/@sivrad/PACKAGE_NAME">NPM 📦</a> | <a href="https://github.com/sivrad/readme-template">Github 🕸</a> ]
</p>

# Installation

```sh
yarn add @sivrad/matrix
```

# Usage

## Create Matrix Instance

```typescript
// Import Matrix from this package.
import { Matrix } from '@sivrad/matrix';
// Import a collection from another package.
// We will be using the example package.
import { collection as exampleCollection } from '@sivrad/matrix-collection-example';

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
