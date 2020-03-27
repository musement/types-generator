# Types Generator

Types generator is a Typescript project that allows to generate types for Typescript or Flow starting from a Swagger/OpenAPI documents.

## Getting Started

Install Types generator using [`yarn`](https://yarnpkg.com/en/package):

```bash
yarn add --dev types-generator
```

Or [`npm`](https://www.npmjs.com/):

```bash
npm install --save-dev types-generator
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

You can run type generator directly from the CLI (if it's globally available in your PATH, e.g. by yarn global add types-generator or npm install types-generator --global)

Here's how to run types generator:

```
generate-types -s https://swagger -t Flow
```

## Type generator CLI options

```
"--destination", "-d": local path where the generated file should be placed,
```
```
"--source", "-s": url to the swagger or path to the file,
```
```
"--type", "-t": "Flow" or "Typescript",
```
```
"--exitOnInvalidType", "-e": block the execution of the programs if there are errors on the swagger,
```


## Running the tests

```
npm run test
```

## Built With

* [fp-ts](https://github.com/gcanti/fp-tsa) - Used as functional programming library

<!-- ## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us. -->

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Marco Ziliani** - *Initial work* - [GitHub](https://github.com/zi)
* **Michele Dinoia** - *Initial work* - [GitHub](https://github.com/dinoiam)

<!-- See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project. -->

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
<!-- 
## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc -->
