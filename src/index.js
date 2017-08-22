const { Map } = require('immutable');

const buildTimeoutPromise = (timeout) =>
new Promise((resolve, reject) => {
  const msg = `Promise timed out after ${timeout}ms`;
setTimeout(() => reject(msg), timeout);
});

class PromiseExecutor {
  queue = Map();
  numPending = 0;
  maxPending;
  timeout;

  constructor(maxPendingPromises = 5, timeout = 30000) {
    this.maxPending = maxPendingPromises;
    this.timeout = timeout;
  }

  execute = (promiseCreator) =>
  new Promise((resolve, reject) => {
  const key = Symbol();
  this.queue = this.queue.set(key, () => {
    Promise.race([promiseCreator(), buildTimeoutPromise(this.timeout)])
    .then(resolve)
    .catch(reject)
    .then(() => {
    this.numPending -= 1;
  this.processQueue();
});
});
this.processQueue();
});

processQueue = () => {
  const numExecutions = this.maxPending - this.numPending;
  this.queue
    .take(numExecutions)
    .forEach(executeRequest => {
    this.numPending += 1;
  return executeRequest();
});
  this.queue = this.queue.skip(numExecutions);
}
}

module.exports = PromiseExecutor;