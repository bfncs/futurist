# Futurist

[![Build Status](https://travis-ci.org/bfncs/futurist.svg?branch=master)](https://travis-ci.org/bfncs/futurist)

Futurist helps executing promises with limited parallelism.

## Usage

```js
const Futurist = require('futurist');

const futurist = new Futurist(2, 10000);

futurist.execute(() => fetch('http://example.com'))
    .then(console.log)
    .catch(console.error);
```

## API

### `new Futurist(maxPendingPromises, timeout)`

Create a new Futurist instance to execute promises.

#### Parameters

1. `maxPendingPromises: Number`: Optional. Number of maximum parallel pending promises at any time (default: `5`).
2. `timeout: Number`: Optional. Timeout in ms before a request is rejected (default: `30000`). The timeout at the time of promise execution, not when adding a promise.

#### Returns

The Futurist instance

### futurist.execute(promiseCreator)

Add a new promise creator to be executed as soon as possible.

### Parameters

1. `promiseCreator: Function`: A function that returns the `Promise` to be executed.

#### Returns

A `Promise` that is resolved/rejected when the Promise returned by `promiseCreator` is resolved/rejected or rejected when resolution takes longer than the defined timeout.