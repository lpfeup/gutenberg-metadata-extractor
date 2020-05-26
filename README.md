## 1. Getting started
### 1.1. Clone repository
```
git clone https://github.com/lpfeup/gutenberg-metadata-extractor
```

### 1.2. Install dependencies
```
cd gutenberg-metadata-extractor && npm i
```

## 2. Running locally
This program requires a running [PostgreSQL](https://www.postgresql.org/) instance.
PostgreSQL can either be installed from the official Downloads page (https://www.postgresql.org/download/) or executed within a Docker container.

### 2.1. Running Dockerized PostgreSQL (optional)
1. Install Docker and Docker Compose by following the instructions from the official page (https://docs.docker.com/get-docker/)
2. Run Dockerized PostgreSQL instance via docker-compose:
```
docker-compose up -d postgres
```

This command will start a `postgres-gutenberg` container as configured in `docker-compose.yml`.
Credentials:
 - Username: postgres
 - Password: postgres
 - Database gutenberg

These database credentials are configured for the project under `lib/db/config/config.json`.

### 2.2. Running program
1. Download RDF file archive from https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip
2. Extract archive to `data` subdirectory
3. Execute program including relative path to the RDF data directory or single RDF file
```
# Single file
node main --file ./data/cache/epub/1/pg1.rdf

# Directory
node main --dir ./data/cache/epub
```

## 3. Testing locally

Run tests
```
docker-compose up -d postgres
npm test
```

Generate coverage report
```
npm run converage
```

## 4. Linting
This project is configured to use [ESLint](https://eslint.org/) together with [Prettier](https://prettier.io/) for linting.

Run with
```
npm run lint
```

## 5. Environment
Both local and test executions have been performed under the following environment:
 - OS: Windows 10
 - Node.js: v12.16.1
 - PostgreSQL: v12.3 (dockerized, docker v19.03.8)


## 6. Notes
Latest stable version of [istanbul](https://www.npmjs.com/package/istanbul) (v0.4.5) does not support async methods for classes (see https://github.com/gotwarlost/istanbul/issues/733). As a workaround, 1.1.0-alpha.1 was installed.

