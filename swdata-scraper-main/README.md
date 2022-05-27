# swdata-scraper

### Data sources

#### Hasura

Development cycle

use `hasura console` to start the local interface on `localhost:9695`
- Use local Docker instance to develop Hasura config, SQL tables, etc
- store configuration in repo
  In `hasura/swdata`:

1. `hasura metadata export`


#### Graph

Update Graph schema from `./server` using this command:

`gq http://localhost:8080/v1/graphql --introspect > ./src/resources/schema.graphql`

#### Docker

Local development:

1. Build Docker locally: `docker build . -t swdata-hoarder` from `./server`
2. Run docker-compose with .env.docker file available to spin up backend environment from `./server`: `docker-compose -p "swdata-backend" up -d`

Note: Make sure the `.env` file doesn't contain quotation marks or the env variables break

GCP deployment:

1. Build linux/arm64: `yarn build:docker-deploy` from `./server`
2. Push to GCP repo: `docker push eu.gcr.io/sw-dao/ingester`
3. Reset instance: `gcloud compute instances update-container ingester-staging`

Note: auth Google Cloud <> Docker to push the image
