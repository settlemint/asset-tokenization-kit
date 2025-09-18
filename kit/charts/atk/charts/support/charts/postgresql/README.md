# postgresql

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 17.5](https://img.shields.io/badge/AppVersion-17.5-informational?style=flat-square)

A simple PostgreSQL Helm chart for ATK development

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment (object) |
| commonLabels | object | `{"app.kubernetes.io/managed-by":"helm","kots.io/app-slug":"settlemint-atk"}` | Common labels to add to all PostgreSQL resources (list) |
| fullnameOverride | string | `"postgresql"` | String to fully override common.names.fullname (string) |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.registry | string | `"docker.io"` |  |
| image.repository | string | `"postgres"` |  |
| image.tag | string | `"17.6-alpine"` |  |
| initdb | object | `{"scripts":{"create_databases.sql":"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"}}` | Database initialization configuration (object) |
| initdb.scripts | object | `{"create_databases.sql":"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"}` | Database initialization scripts (string) |
| initdb.scripts."create_databases.sql" | string | `"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"` | SQL script to create databases and users for all ATK services (bool) |
| nodeSelector | object | `{}` | Node labels for pod assignment (object) |
| persistence.accessModes[0] | string | `"ReadWriteOnce"` |  |
| persistence.enabled | bool | `true` |  |
| persistence.size | string | `"8Gi"` |  |
| persistence.storageClass | string | `""` |  |
| podDisruptionBudget | object | `{"enabled":false,"minAvailable":1}` | Pod disruption budget configuration (object) |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget (bool) |
| podDisruptionBudget.minAvailable | int | `1` | Minimum number of available pods (int) |
| podSecurityContext.fsGroup | int | `999` |  |
| podSecurityContext.runAsNonRoot | bool | `true` |  |
| podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| postgresql.database | string | `"postgres"` |  |
| postgresql.password | string | `"atk"` |  |
| postgresql.username | string | `"postgres"` |  |
| postgresql_conf | object | `{"checkpoint_completion_target":0.9,"default_statistics_target":100,"effective_cache_size":"1GB","effective_io_concurrency":200,"maintenance_work_mem":"64MB","max_connections":1000,"max_wal_size":"4GB","min_wal_size":"1GB","random_page_cost":1.1,"shared_buffers":"256MB","wal_buffers":"16MB","work_mem":"4MB"}` | PostgreSQL configuration parameters (object) |
| postgresql_conf.checkpoint_completion_target | float | `0.9` | Target for completion of checkpoint processing (string) |
| postgresql_conf.default_statistics_target | int | `100` | Default statistics target for table columns (string) |
| postgresql_conf.effective_cache_size | string | `"1GB"` | Planner's assumption about the effective size of the disk cache (string) |
| postgresql_conf.effective_io_concurrency | int | `200` | Number of concurrent disk I/O operations (int) |
| postgresql_conf.maintenance_work_mem | string | `"64MB"` | Specifies the maximum amount of memory for maintenance operations (int) |
| postgresql_conf.max_connections | int | `1000` | Maximum number of concurrent connections (int) |
| postgresql_conf.max_wal_size | string | `"4GB"` | Maximum size to which the WAL will grow during automatic checkpoints (int) |
| postgresql_conf.min_wal_size | string | `"1GB"` | Minimum size to which the WAL will shrink (int) |
| postgresql_conf.random_page_cost | float | `1.1` | Planner's assumption about the cost of a non-sequentially-fetched disk page (string) |
| postgresql_conf.shared_buffers | string | `"256MB"` | Amount of memory dedicated to PostgreSQL to use for caching data (string) |
| postgresql_conf.wal_buffers | string | `"16MB"` | Amount of memory used in shared memory for WAL data (string) |
| postgresql_conf.work_mem | string | `"4MB"` | Amount of memory to be used by internal sort operations and hash tables (string) |
| resources.limits.cpu | string | `"500m"` |  |
| resources.limits.memory | string | `"1Gi"` |  |
| resources.requests.cpu | string | `"100m"` |  |
| resources.requests.memory | string | `"256Mi"` |  |
| securityContext.allowPrivilegeEscalation | bool | `false` |  |
| securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| securityContext.runAsGroup | int | `999` |  |
| securityContext.runAsNonRoot | bool | `true` |  |
| securityContext.runAsUser | int | `999` |  |
| securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| service.port | int | `5432` |  |
| service.targetPort | int | `5432` |  |
| service.type | string | `"ClusterIP"` |  |
| tolerations | list | `[]` | Tolerations for pod assignment (list) |
