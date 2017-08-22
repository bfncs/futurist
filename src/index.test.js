const PromiseExecutor = require('./index');

jest.useFakeTimers();

const RESULT = Symbol();
const ERROR = Symbol();
const EXECUTOR_TIMEOUT = 100;
const IN_TIME_PROMISE_TIMEOUT = EXECUTOR_TIMEOUT - 10;
const TIMED_OUT_PROMISE_TIMEOUT = EXECUTOR_TIMEOUT + 10;
const RESOLVING_PROMISE_CREATOR = () => new Promise(resolve => resolve(RESULT));
const REJECTING_PROMISE_CREATOR = () => new Promise((resolve, reject) => reject(ERROR));
const DELAYED_RESOLVING_PROMISE_CREATOR = timeout => () => new Promise(resolve => setTimeout(() => {
  return resolve(RESULT);
}, timeout));

// Helper to await pending promises execution
// See: https://github.com/facebook/jest/issues/2157#issuecomment-279171856
const flushPromises = () => new Promise(resolve => setImmediate(resolve));


it('resolves resolving promises', async () => {
  expect.assertions(1);

  const result = await new PromiseExecutor().execute(RESOLVING_PROMISE_CREATOR);
  expect(result).toEqual(RESULT);
});


it('rejects rejecting promises', async () => {
  expect.assertions(1);

  try {
    await new PromiseExecutor().execute(REJECTING_PROMISE_CREATOR);
  } catch (e) {
    expect(e).toEqual(ERROR);
  }
});


it('resolves promises in timeout', () => {
  expect.assertions(1);

  const promise = new PromiseExecutor(EXECUTOR_TIMEOUT)
    .execute(DELAYED_RESOLVING_PROMISE_CREATOR(IN_TIME_PROMISE_TIMEOUT));

  jest.runTimersToTime(IN_TIME_PROMISE_TIMEOUT);

  expect(promise).resolves.toEqual(RESULT);
});


it('rejects promises that resolve after timeout', async () => {
  expect.assertions(3);

  const successCallback = jest.fn();
  const errorCallback = jest.fn();

  new PromiseExecutor(1, EXECUTOR_TIMEOUT)
    .execute(DELAYED_RESOLVING_PROMISE_CREATOR(TIMED_OUT_PROMISE_TIMEOUT))
    .then(successCallback)
    .catch(errorCallback);

  jest.runTimersToTime(EXECUTOR_TIMEOUT);
  await flushPromises();

  expect(successCallback.mock.calls.length).toBe(0);
  expect(errorCallback.mock.calls.length).toBe(1);
  expect(errorCallback.mock.calls[0][0])
    .toBe(`Promise timed out after ${EXECUTOR_TIMEOUT}ms`);
});