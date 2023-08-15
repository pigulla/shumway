# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2023-08-15

### Chore

-   Update dependencies to fix a potential security issue.

## [1.0.1] - 2023-01-23

### Chore

-   Update dependencies to fix a potential security issue.

## [1.0.0] - 2022-10-12

### Added

-   Include `Handler` type in default export.

## [0.0.3] - 2022-04-23

### Changed

-   Removed `continueOnCallbackError` option

## [0.0.2] - 2022-04-11

### Changed

-   Errors thrown from a predicate callback are now always re-thrown as a `PredicateError`
-   Handler option `callbackErrorAction` renamed to `onCallbackError`

### Added

-   Configure [dependabot](https://docs.github.com/en/code-security/dependabot) for automated dependency updates

## [0.0.1-alpha] - 2022-04-04

-   Initial [release on npm](https://www.npmjs.com/package/shumway).
