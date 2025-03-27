# Turborepo Docker starter

This is a community-maintained example. If you experience a problem, please submit a pull request with a fix. GitHub Issues will be closed.

## Using this example

Run the following command:

```sh
npx create-turbo@latest -e with-docker
```

## What's inside?

This Turborepo includes the following:

### Apps and Packages

- `frontend`: a [React](https://nextjs.org/) app
- `backend`: an [Express](https://expressjs.com/) server

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Docker

This repo is configured to be built with Docker, and Docker compose. To build all apps in this repo:

```
# Install dependencies
yarn install

# Spin up with docker containers
sh scripts/docker-up.sh

```

Open http://localhost:3000.

To shutdown all running containers:

```
# Stop all running containers
sh scripts/docker-down.sh
```