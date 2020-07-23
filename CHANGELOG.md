# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.8](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.7...v0.0.8) (2020-07-23)


### Bug Fixes

* convert property names to camelCase ([4486710](https://gitlab.com/musement/experiments/types-generator/commit/4486710f7272ac7cb0c93bba9cf83c79d6034dba))

### [0.0.7](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.6...v0.0.7) (2020-04-09)


### Bug Fixes

* in Flow numbers cannot be keys ([79c8329](https://gitlab.com/musement/experiments/types-generator/commit/79c8329a240b18f649b9a29e17cc7cd32ab2eeea)), closes [#5](https://gitlab.com/musement/experiments/types-generator/issues/5)

### [0.0.6](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.5...v0.0.6) (2020-04-08)


### Features

* swagger's patch as an object ([6ae1bb6](https://gitlab.com/musement/experiments/types-generator/commit/6ae1bb6fa28bbb47ccd47f3ec0726200a83867c8))

### [0.0.5](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.4...v0.0.5) (2020-04-08)


### Features

* build as library ([cb3399a](https://gitlab.com/musement/experiments/types-generator/commit/cb3399a7050c4f9a04a1c9f053cb1c5d04f79475)), closes [#4](https://gitlab.com/musement/experiments/types-generator/issues/4)

### [0.0.4](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.3...v0.0.4) (2020-04-07)


### Features

* add strict header ([82e9111](https://gitlab.com/musement/experiments/types-generator/commit/82e911193fb784f2a3e1c2cc8ef2c42f3c336ee0))


### Bug Fixes

* incorrect allOf property in Flow ([74f60ab](https://gitlab.com/musement/experiments/types-generator/commit/74f60ab23f41fe9681016079919a3bdb09de5f67)), closes [#1](https://gitlab.com/musement/experiments/types-generator/issues/1)

### [0.0.3](https://gitlab.com/musement/experiments/types-generator/compare/v0.0.2...v0.0.3) (2020-04-01)


### Features

* add patchSource option ([efb90fc](https://gitlab.com/musement/experiments/types-generator/commit/efb90fc1f84d3069e1b33110739785baa1a11540))
* handle allOf / anyOf / oneOf that have a "type" ([be1881d](https://gitlab.com/musement/experiments/types-generator/commit/be1881d5cdda7f25a231f4f28a48a8cbc9b1e9c1))


### Bug Fixes

* handle "object" without properties ([008addd](https://gitlab.com/musement/experiments/types-generator/commit/008adddcbe4d4f8a15ef07f4366cadf5f7281d98))

### 0.0.2 (2020-03-27)


### Features

* add 'type' option ([c8f1078](https://gitlab.com/musement/experiments/types-generator/commit/c8f1078fe5334a0b49bd5b8108eb2b75fb6b27c7))
* add build and entry point ([bab65c0](https://gitlab.com/musement/experiments/types-generator/commit/bab65c058bd70f63fe3585345652a8c2af76b46b))
* add cli module ([697f193](https://gitlab.com/musement/experiments/types-generator/commit/697f193943e36141d5340c6960e1d0ef161560a5))
* add module to write file to filesystem ([217ab7f](https://gitlab.com/musement/experiments/types-generator/commit/217ab7f46713f976422968086962d85e61e1e979))
* add option exitOnInvalidType ([78c041b](https://gitlab.com/musement/experiments/types-generator/commit/78c041bd3c608ed8581386c95920c0826e7f53d9))
* add output ([165315b](https://gitlab.com/musement/experiments/types-generator/commit/165315b8ed590649825b66cac6e917221684ed5a))
* add program module ([87c316d](https://gitlab.com/musement/experiments/types-generator/commit/87c316d8566f8aca115c8277fbfeb76ac50c6795))
* add yaml support ([54857dd](https://gitlab.com/musement/experiments/types-generator/commit/54857dd1762ce51a5622b29575113eff8abd6d8d))
* check openapi version ([b238a8d](https://gitlab.com/musement/experiments/types-generator/commit/b238a8d92a459dd004bfb4a48e08490333ebbdc6))
* generate types from swagger ([4bde948](https://gitlab.com/musement/experiments/types-generator/commit/4bde948c1bfa89fc8bc4e37a0e43dd7f13c55566))
* handle exact types with flow ([6332f6e](https://gitlab.com/musement/experiments/types-generator/commit/6332f6e23e0f1a7ca9940640d949429b1aa296de))
* handle nullable property ([23d58be](https://gitlab.com/musement/experiments/types-generator/commit/23d58bef8747167d6a452c2f79201d984195c208))
* handle required properties ([eceac3b](https://gitlab.com/musement/experiments/types-generator/commit/eceac3bb9538ddfbf15b11326e943b9f96fd8a4f))
* handle swagger download ([ed80752](https://gitlab.com/musement/experiments/types-generator/commit/ed807520f28169cab50444c721b59708b02ea9c5))
* handle unknown types ([c4d5e25](https://gitlab.com/musement/experiments/types-generator/commit/c4d5e25eaf7586f9b16d74dd7d7fdedcce07ec67))
* read swagger from file ([870b257](https://gitlab.com/musement/experiments/types-generator/commit/870b257239844266ef9fdc151b10ad6ff088c1e8))


### Bug Fixes

* add 'export' to definitions ([26ff053](https://gitlab.com/musement/experiments/types-generator/commit/26ff053383179a90c0c3aadfdaf8bb556beeced9))
* convert type names to PascalCase ([703545e](https://gitlab.com/musement/experiments/types-generator/commit/703545e235d17cf58de556b69a640537bb148775))
* handle case in which 'properties' are missing ([adb8729](https://gitlab.com/musement/experiments/types-generator/commit/adb87299c9c29ea0f39d6601d208beb74a8a7d7a))
* make download functional ([5fb902e](https://gitlab.com/musement/experiments/types-generator/commit/5fb902e6300a050de24a1ccba4e0ad12011bb0a7))
* remove default options for source and destination ([7631bf7](https://gitlab.com/musement/experiments/types-generator/commit/7631bf7dbe81f5d5fd6b1d73651ff80be94ce882))
