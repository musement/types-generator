# Types Generator

Types generator is a Typescript project that allows to generate types for Typescript or Flow starting from a Swagger/OpenAPI document.

## Getting Started

Install Types generator using [`npm`](https://www.npmjs.com/):

```bash
npm install --save-dev @musement/types-generator
```

Or [`yarn`](https://yarnpkg.com/en/package):

```bash
yarn add --dev @musement/types-generator
```

Add the following section to your package.json:
```
{
  "scripts": {
    "generate-types": "generate-types"
  }
}
```
Finally, run yarn generate-types or npm run generate-types

## Running from command line

You can run type generator directly from the CLI if it's globally available in your PATH.

```bash
npm install -g @musement/types-generator
```

Or [`yarn`](https://yarnpkg.com/en/package):

```bash
yarn global add @musement/types-generator
```

Here's how to run types generator:

```
generate-types -s https://swagger -t Flow
```

### Type generator CLI options

```
"--destination", "-d": local path where the generated file should be placed,
```
```
"--source", "-s": url to the swagger or path to the file,
```
```
"--type", "-t": "Flow", "Typescript" or "CodecIoTs",
```
```
"--exitOnInvalidType", "-e": block the execution of the programs if there are errors on the swagger,
```
```
"--patchSource", "-e":  url or path of the patch. The patch is a file whose content is merged with the swagger
```


## Running the tests

```
npm run test
```

## Built With

* [fp-ts](https://github.com/gcanti/fp-tsa) - Used as functional programming library

## Using the issue tracker

The issue tracker is the preferred channel for `bug reports` and `features requests`.


# Example
```
ts-node src/index.ts --source ./schema.yaml --type CodecIoTs --destination ./out/index.ts --parser typescrip
```