Deployment Guide: https://hasura.io/docs/latest/graphql/core/deployment/deployment-guides/google-kubernetes-engine-cloud-sql.html

`config.yaml` is used by Hasura CLI to help with migrations and stuff

1. hasura metadata export
2. hasura migrate create [MIGRATION_LABEL] --from-server --schema prices --database-name [DB_NAME]
