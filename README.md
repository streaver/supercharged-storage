# Supercharged Storage

<p align="center">
  <img src="https://user-images.githubusercontent.com/7522836/75284215-19d0b880-57f3-11ea-8e15-6b5b187189f6.png" height="100px">
  <p align="center">A supercharged storage that lets you do a lot of new things like expirations, default values and a lot of other things the regular web storages don't let you do.<p>

  <p align="center">
    <a href="https://npmjs.org/package/supercharged-storage">
      <img src="https://img.shields.io/npm/v/supercharged-storage.svg" />
    </a>
    <a href="https://circleci.com/gh/streaver/supercharged-storage/tree/master">
      <img src="https://circleci.com/gh/streaver/supercharged-storage/tree/master.svg?style=shield" />
    </a>
    <a href="https://codeclimate.com/github/streaver/supercharged-storage/maintainability">
      <img src="https://api.codeclimate.com/v1/badges/e6725f51619a0c309f80/maintainability" />
    </a>
    <a href="https://codeclimate.com/github/streaver/supercharged-storage/test_coverage">
      <img src="https://api.codeclimate.com/v1/badges/e6725f51619a0c309f80/test_coverage" />
    </a>
    <a href="https://github.com/streaver/supercharged-storage/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/streaver/supercharged-storage.svg" />
    </a>
  </p>
</p>

## Motivation

Sometimes you just need a little bit more than the plain `localStorage` or `sessionStorage` but you don't want to build that feature or to load an external library with many Kilobytes. You might want to have data store with expiration times, of maybe some namespaces to keep the data separated, default values, and what not?

It happened to us as well, so we extracted this from [@streaver/vue-preferences](https://github.com/streaver/vue-preferences) so you can use in any type of javascript project.


## Table of content

* [Installation](#installation)
* [Usage](#usage)
* [Options](#options)
* [Contributing](#contributing)
* [Credits](#credits)

## Installation

If you prefer `yarn`:

```
$ yarn add supercharged-storage --save
```

or with `npm`:

```
$ npm install supercharged-storage --save
```

## Usage

First you need to tell the storage which features (plugins) you want to use, that is pretty easy to do and allows you to only import the things you need and tree-shake the hell out of your app so you keep your bundle size small!

```javascript
// Somewhere in your app, just before starting to use the storage
// In this case we want to use the Defaultable and Namespaceable
// storage features, keep reading to find out more features.
import SuperchargedStorage, {
  DefaultableStorage,
  NamespaceableStorage,
} from 'supercharged-storage';

SuperchargedStorage.use(DefaultableStorage);
SuperchargedStorage.use(NamespaceableStorage);
```

This only needs to be done once, in the `main.js` or `index.js` file of your app or wherever you want to initialize the storage capabilities. If you don't this you will have a proxy for the underlying storage doing basically nothing, not very fun at all!

After doing that you have a configured storage which will know how to use the plugins you provided and use the options you use. In this case we need our storage to have a default value of `''` and a namespace of `user-details` since we are going to be saving some basic user details.

```javascript
const storage = SuperchargedStorage.build({
  defaultValue: '',
  namespace: 'user-details',
});

storage.setItem('firstName', 'Jane');
storage.setItem('lastName', 'Doe');

console.log(`Mrs ${storage.getItem('firstName')} ${storage.getItem('nameName')}`)
```

Under the hood this is using `localStorage` to persist the data (it is the default), but you can change that, you can use `sessionStorage`, or any storage implementation you want as long as it has the same API as `localStorage`, that means you need a `getItem`, `setItem`, `removeItem` and `clear` function.

You can have multiple storages that have different configurations. Simply initialize them with different options like this:

```javascript
const storage1 = SuperchargedStorage.build({
  defaultValue: '',
  namespace: 'user-details',
  storage: sessionStorage,
});

const storage2 = SuperchargedStorage.build({
  defaultValue: 0,
  namespace: 'counters',
  storage: localStorage,
});
```

## Options

This are the available storages and the options and capabilities that each of them add to the storage you build:

### BaseStorage

This is the most basic of the available storages and is always included as part of the initialization of `supercharged-storage`. It provides only one option, the `storage` option which allows you to define which is the underlying storage you want to use, the default value for this option is `window.localStorage`.

If you don't configure the storage, then the `BaseStorage` will behave as a proxy to the underlying storage.

```javascript
import SuperchargedStorage from 'supercharged-storage';

const storage = SuperchargedStorage.build({
  storage: sessionStorage,
});
```

### DefaultableStorage

As the name suggests this storage allows your storage to have default values for when the data you are looking for is not there anymore. If you are using `localStorage` or `sessionStorage` the browser might need to delete the data for any number of reasons, also the users can delete the data.

By using this you have access to the `defaultValue` option which will be used as the default return value for any non-successfully `get` operation.

```javascript
import SuperchargedStorage, { DefaultableStorage } from 'supercharged-storage';

SuperchargedStorage.use(DefaultableStorage);

const storage = SuperchargedStorage.build({
  defaultValue: 'None',
});

storage.getItem('firstName') // "None"
storage.setItem('firstName', 'Jon')
storage.getItem('firstName') // "Jon"
```

### NamespaceableStorage

This storage allows you to setup a namespace for each storage this is very useful if you need to keep data separated between parts of the application. For example different views might have their own namespace so they can remember  options independently.

This storage enables the option `namespace` to be used as follows:

```javascript
import SuperchargedStorage, { NamespaceableStorage } from 'supercharged-storage';

SuperchargedStorage.use(NamespaceableStorage);

const player1 = SuperchargedStorage.build({
  namespace: 'player1',
});

const player2 = SuperchargedStorage.build({
  namespace: 'player2',
});

player1.setItem('firstName', 'Jon1');
player2.setItem('firstName', 'Jon2');

player1.getItem('firstName'); // Jon1
player2.getItem('firstName'); // Jon2
```

### ExpirableStorage

With this storage you enable two options `ttl` (time-to-live) and `expiration`, this options should not be used at the same time, but if used the `ttl` option will take precedence.

The `ttl` option is the *amount of seconds* after which a saved property will be considered expired. The `expiration` option can be an instance of `Date` or a function returning a `Date` which indicates the expiration date of the properties.

If this storage is combined with the `DefaultableStorage`, when a property is expired, then the `defaultValue` will be returned it not the underlying storage default value will be returned.

```javascript
import SuperchargedStorage, { ExpirableStorage } from 'supercharged-storage';

SuperchargedStorage.use(ExpirableStorage);

const shortLivedStorage = SuperchargedStorage.build({
  ttl: 5,
});

const predefinedExpirationDate = SuperchargedStorage.build({
  expiration: new Date(2021, 1, 1), // Mon Feb 01 2021 00:00:00
});

const dynamicExpirationDate = SuperchargedStorage.build({
  expiration: () => {
    return new Date(2021, 1, 1);
  }
});

shortLivedStorage.setItem('lastName', 'Doe'); // Expires in 5 seconds
predefinedExpirationDate.setItem('firstName', 'Jon'); // Expires on Mon Feb 01 2021 00:00:00
dynamicExpirationDate.setItem('age', 23); // Expires on Mon Feb 01 2021
```

### SerializableStorage

This storage enables you to provide custom a serializer/deserializer when writing/reading properties to/from the storage. By default anything you provide will be serialized with `JSON.stringify` and deserialized with `JSON.parse`. But if you want to change this you can use the `serializer` and `deserializer` options of the storage enabled by this plugin for example:

```javascript
import SuperchargedStorage, { SerializableStorage } from 'supercharged-storage';

SuperchargedStorage.use(SerializableStorage);

const simpleCsvStorage = SuperchargedStorage.build({
  serializer: (data) => data.join(','),
  deserializer: (data) => data.split(',');
});

simpleCsvStorage.setItem('data', [1,2,3,4]); // Will be saved as "1,2,3,4"
simpleCsvStorage.getItem('data'); // Will return [1,2,3,4]
```

🚀 In the future, we will be supporting other custom options that will add even more power to the storage. Stay tuned and support!

## Contributing

All contributions or issue reporting are welcomed. If you are submitting a bug issue please include information to help us debug it!

If you plan to contribute, please make sure you test the code. Any new feature or bug fix should have its own test case.

## Credits

Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
