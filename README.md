# docker-compose-watch

An experimental project to add change detection to Docker Compose projects.

Change detection rules must be configured in `docker-compose.yml` file in order to be effective.

## Usage

```bash
npm install -g @ckk/docker-compose-watch
dcw
```

This will run `docker-compose up` command and reload services on file change detection.

### Wrapper

You can use `dcw` command as a docker-compose wrapper. It will pipe all other commands. (Not perfectly at the moment)

```bash
alias docker-compose=dcw
docker-compose watch
```


## Configuration

Watch configuration should be done in root object with key `x-watch`. Like this:

```yaml
x-watch:
  name-of-the-rule:     # only for display purposes
    services: pattern-* # glob pattern string to match compose service names
    watch: volumes      # either 'volumes' or 'buildcontext' to for watching directory
    match: '**/*.js'    # filename pattern to trigger change detection
    build: false        # whether building image is needed, useful for source code mounting
```


See a project example below:

```yaml
version: '2.2'
services:
  store-payment-service:
    build:
      context: ./store/services/payment-service
    volumes:
      - ./store/services/payment-service/src:/app/src:cached
  store-front-service:
    command: 'node src/index.js'
    build: ./store/services/front-service
    volumes:
      - ./store/services/front-service/src:/app/src:cached
  mongodb:
    image: 'mongo:3.4'
    ports: ['27017:27017']
x-watch:
  source-files:
    services: store-*
    watch: volumes
    match: '**/*.js'
    build: false
  dependencies:
    services: store-*
    watch: buildcontext
    match: 'package.json'
    build: true
```

See the full working example with dummy services and Dockerfiles under [`test/fixture`](./test/fixture) directory.
