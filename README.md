[![npm](https://img.shields.io/npm/v/shumway?style=flat-square&cacheSeconds=3600)](https://www.npmjs.com/package/shumway)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/pigulla/shumway/Node.js%20CI?style=flat-square&cacheSeconds=3600)](https://github.com/pigulla/shumway/actions?query=branch%3Amain)
[![GitHub Issues](https://img.shields.io/github/issues-raw/pigulla/shumway?style=flat-square&cacheSeconds=3600)](https://github.com/pigulla/shumway/issues)
[![requires.io](https://img.shields.io/requires/github/pigulla/shumway?style=flat-square&cacheSeconds=3600)](https://requires.io/github/pigulla/shumway/requirements/?branch=main)
[![Codecov](https://img.shields.io/codecov/c/github/pigulla/shumway?style=flat-square&cacheSeconds=3600)](https://app.codecov.io/gh/pigulla/shumway)
[![npm bundle size](https://img.shields.io/bundlephobia/min/shumway?style=flat-square&cacheSeconds=3600)](https://bundlephobia.com/package/shumway)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/shumway?style=flat-square&cacheSeconds=3600)](https://snyk.io/advisor/npm-package/shumway)

# shumway

> Surely there must be _shumway_ to make error handling easier!

#### Safe and simple to use

-   🕵️‍♀️ Thoroughly tested
-   🕮 Well documented
-   ✨ No additional dependencies (except [debug](https://www.npmjs.com/package/debug))
-   😊 Uses [Semantic Versioning](https://semver.org/) and keeps a [nice](https://keepachangelog.com/en/1.0.0/) [Changelog](https://github.com/pigulla/shumway/blob/main/CHANGELOG.md)

## Elevator Pitch

Asynchronous calls typically involve some kind of I/O, such as network requests or disk operations, both of which are prone to errors and can fail in all sorts of ways.
Oftentimes, especially when in a [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), you want to hide implementation details - in this case errors - from the rest of the application.

In order to do so, it is commonly considered good practice to throw more "abstract" errors, so maybe a custom `RemoteFooProviderError` instead of just letting the error thrown by the used HTTP client bubble up. This is frequently combined with adding some additional logic like so:

```typescript
public async getFooFromRemoteSource(id: number): Promise<Foo> {
    let response: FooResponse

    try {
        response = await this.httpClient.get(`/foo/${id}`)
    } catch (error) {
        if (error instanceof HttpClientError) {
            if (error.statusCode === 404) {
                throw new FooNotFoundError(id)
            }

            throw new FooRemoteSourceError(error)
        }

        throw new UnexpectedFooRemoteSourceError(error)
    }

    return new Foo(response.data)
}
```

While there is nothing wrong with that approach per se, it quickly becomes tedious (and increasingly annoying to maintain) once you have multiple methods that share the same error handling boilerplate.
It is also not particularly nice-looking code because the signal-to-noise-ratio is fairly poor.

This is the problem this module sets out to solve:

```typescript
@HandleError(
    {
        action: HandlerAction.MAP,
        scope: HttpClientError,
        predicate: error => (error as HTTPError).statusCode === 404,
        callback: (_error, id) => new DeviceNotFoundError(id),
    }, {
        action: HandlerAction.MAP,
        scope: HttpClientError,
        callback: error => new FooRemoteSourceError(error),
    }, {
        action: HandlerAction.MAP,
        callback: error => new UnexpectedFooRemoteSourceError(error),
    },
)
public async getFooFromRemoteSource(id: number): Promise<Foo> {
    const response = await this.httpClient.get(`/foo/${id}`)
    return new Foo(response.data)
}
```

For a more complete (and more realistic) example, check out our use cases, e.g. the [API wrapper use case](https://github.com/pigulla/shumway/blob/main/test/api-wrapper/api-wrapper.use-case.ts).

### Caveats and known limitations

-   This library currently works only with asynchronous functions. A version for synchronous functions could be added later if there is a need for it.
-   By its very nature, decorators do not work with plain functions (only class methods).

## Installation

Use your favorite package manager to install:

```bash
npm install shumway
```

## Usage

Simply decorate your class methods with `@HandleError` and configure as needed:

```typescript
class Foo {
    @HandleError({
        action: HandlerAction.RECOVER,
        callback: () => 'my fallback value',
    })
    public async thouShaltNotThrow(): Promise<string> {
        // ...
    }
}
```

Remember that a handler is only ever called if the wrapped function throws an error.

## Error Handlers

This package provides a variety of handlers (specified by the `action` property, the examples above).

### Common Options

Every handler supports the following options:

-   `scope: Class<Error>` _(optional)_  
    Limit the handler to exceptions of the given class (or any subclass thereof).
-   `predicate: (error, ...parameters) => boolean | Promise<boolean>` _(optional)_  
    Dynamically skip invocation of the handler depending on the error thrown or any of the wrapped method's parameters. The predicate is invoked with the same context as the wrapped function (unless you use an arrow function).

### MAP

> The `MAP` action allows you to map an error to a different one.

It accepts the following additional options:

-   `callback: (error, ...parameters) => Error | Promise<Error>` _(mandatory)_  
     The error thrown by the function will be replaced by the error returned by the callback. Note that the callback must `return` the new error, not `throw` it. The callback is invoked with the same context as the wrapped function (unless you use an arrow function).
-   `callbackErrorAction: CallbackErrorAction` _(optional, defaults to `THROW_WRAPPED`)_  
     This option controls how errors thrown by the callback are handled.
    -   `THROW_WRAPPED`: The error is wrapped in an `MapError`. This is the default.
    -   `THROW`: The error is thrown as-is.
    -   `THROW_TRIGGER`: The error is ignored and the triggering error is thrown instead.
-   `continueOnCallbackError` _(optional, defaults to `false`)_  
    If set to `true`, any error thrown by the callback will propagate to the next handler in the chain. If `false`, that error is thrown immediately and no other handler is called.
-   `continue: boolean` _(optional)_  
     By default, a mapped error is thrown immediately and no other handler is called. If you want to continue the chain of handlers (now with the mapped error), you can set this parameter to `true`.

### PASS_THROUGH

> The `PASS_THROUGH` action short-circuits the handler chain and causes the current error to immediately be thrown.

It does not accept any additional options.

### RECOVER

> The `RECOVER` action suppresses the thrown error and makes the wrapped function return the provided value instead.

It accepts the following additional options:

-   `callback: (error, ...parameters) => T | Promise<T>` _(mandatory)_  
    The callback must return a value (or Promise) compatible with the return value of the wrapped function. The callback is invoked with the same context as the wrapped function (unless you use an arrow function).
-   `callbackErrorAction: CallbackErrorAction` _(optional, defaults to `THROW_WRAPPED`)_  
    This option controls how errors thrown by the callback are handled.
    -   `THROW_WRAPPED`: The error is wrapped in an `RecoverError`. This is the default.
    -   `THROW`: The error is thrown as-is.
    -   `THROW_TRIGGER`: The error is ignored and the triggering error is thrown instead.
-   `continueOnCallbackError` _(optional, defaults to `false`)_  
    If set to `true`, any error thrown by the callback will propagate to the next handler in the chain. If `false`, that error is thrown immediately and no other handler is called.

### SIDE_EFFECT

> The `SIDE_EFFECT` action executes the given callback but does not affect the error thrown (if it does not throw itself).

It accepts the following additional options:

-   `callback: (error, ...parameters) => Error | Promise<Error>` _(mandatory)_  
    The callback is invoked with the same context as the wrapped function (unless you use an arrow function).
-   `callbackErrorAction: CallbackErrorAction` _(optional, defaults to `THROW_WRAPPED`)_  
    This option controls how errors thrown by the callback are handled.
    -   `THROW_WRAPPED`: The error is wrapped in an `RecoverError`. This is the default.
    -   `THROW`: The error is thrown as-is.
    -   `THROW_TRIGGER`: The error is ignored and the triggering error is thrown instead.
-   `continueOnCallbackError` _(optional, defaults to `false`)_  
    If set to `true`, any error thrown by the callback will propagate to the next handler in the chain. If `false`, that error is thrown immediately and no other handler is called.

### TAP

> The `TAP` action executes the given the callback, ignores errors thrown by it and always throws the original error.

This handler is a shorthand for `SIDE_EFFECT` with `callbackErrorOption` set to `THROW_TRIGGER` and `continueOnCallbackError` set to `true`.

This is the only handler that is guaranteed not to alter the behaviour of the wrapped function (unless it explicitly terminates the application, causes an infinite loop, exhausts available memory or causes some other catastrophic error).

It accepts the following additional options:

-   `callback: (error, ...parameters) => void | Promise<void>` _(mandatory)_  
    The callback is invoked with the same context as the wrapped function (unless you use an arrow function).

## Errors thrown in callbacks

If a callback throws, the `callbackErrorAction` options configures, how the error handling will proceed.

### THROW

The error thrown by the callback is re-thrown as-is.

### THROW_TRIGGER

The error thrown by the callback is ignored and the triggering error is re-thrown instead.

### THROW_WRAPPED

The error thrown by the callback is wrapped in a `SideEffectError`, `MapError`, or `RecoverError` depending on the action. Note that any error thrown from a `TAP` callback is always suppressed.

## Dos and Dont's

### Don't overdo it

If you find yourself writing increasingly complex (and possibly convoluted) error handlers, consider refactoring the code instead.
A function throwing all sorts of different errors is a pretty strong indication that it does too much.

### Do be careful with side effects

Most of the error handlers of this library don't change the semantics of the wrapped method. The
notable exceptions to this are `SIDE_EFFECT` and `RECOVER`. It is recommended to use those sparingly
in order to avoid surprises and unexpected behavior.

### Don't use exceptions for control flow

Using exceptions for control flow is considered an anti-pattern. An exception should, by definition,
not be something you encounter during normal operation of your app. As always, use your best
judgement.

## Debugging

This package uses [debug](https://www.npmjs.com/package/debug) with the `shumway` prefix.
