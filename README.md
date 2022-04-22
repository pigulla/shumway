![Typescript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg?style=flat-square)
[![npm](https://img.shields.io/npm/v/shumway?style=flat-square&cacheSeconds=3600)](https://www.npmjs.com/package/shumway)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/pigulla/shumway/Node.js%20CI?style=flat-square&cacheSeconds=3600)](https://github.com/pigulla/shumway/actions?query=branch%3Amain)
[![GitHub Issues](https://img.shields.io/github/issues-raw/pigulla/shumway?style=flat-square&cacheSeconds=3600)](https://github.com/pigulla/shumway/issues)
[![libraries.io](https://img.shields.io/librariesio/release/npm/shumway?style=flat-square&cacheSeconds=3600)](https://requires.io/github/pigulla/shumway/requirements/?branch=main)
[![Codecov](https://img.shields.io/codecov/c/github/pigulla/shumway?style=flat-square&cacheSeconds=3600)](https://app.codecov.io/gh/pigulla/shumway)
[![npm bundle size](https://img.shields.io/bundlephobia/min/shumway/0.0.1-alpha?style=flat-square&cacheSeconds=3600)](https://bundlephobia.com/package/shumway)
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
class Foo {
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
}
```

While there is nothing wrong with that approach per se, it quickly becomes tedious (and increasingly annoying to maintain) once you have multiple methods that share the same error handling boilerplate.
It is also not particularly nice-looking code because the signal-to-noise-ratio is fairly poor.

This is the problem this module sets out to simplify:

```typescript
class Foo {
    @HandleError(
        {
            action: HandlerAction.MAP,
            scope: HttpClientError,
            predicate: error => (error as HTTPError).statusCode === 404,
            callback: (_error, id) => new DeviceNotFoundError(id),
        },
        {
            action: HandlerAction.MAP,
            scope: HttpClientError,
            callback: error => new FooRemoteSourceError(error),
        },
        {
            action: HandlerAction.MAP,
            callback: error => new UnexpectedFooRemoteSourceError(error),
        },
    )
    public async getFooFromRemoteSource(id: number): Promise<Foo> {
        const response = await this.httpClient.get(`/foo/${id}`)
        return new Foo(response.data)
    }
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

Please [read the wiki](https://github.com/pigulla/shumway/wiki) for more information.
