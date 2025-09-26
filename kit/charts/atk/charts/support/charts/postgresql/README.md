# postgresql

![Version: 2.0.0-alpha.15](https://img.shields.io/badge/Version-2.0.0--alpha.15-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.15](https://img.shields.io/badge/AppVersion-2.0.0--alpha.15-informational?style=flat-square)

A simple PostgreSQL Helm chart for ATK development

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment (object) |
| commonLabels | object | `{"app.kubernetes.io/managed-by":"helm","kots.io/app-slug":"settlemint-atk"}` | Common labels to add to all PostgreSQL resources |
| fullnameOverride | string | `"postgresql"` | String to fully override common.names.fullname (string) |
| image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"postgres","tag":"18.0-alpine"}` | Image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| image.registry | string | `"docker.io"` | Image registry |
| image.repository | string | `"postgres"` | Image repository |
| image.tag | string | `"18.0-alpine"` | Image tag |
| initdb | object | `{"scripts":{"create_databases.sql":"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"}}` | Database initialization configuration (object) |
| initdb.scripts | object | `{"create_databases.sql":"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"}` | Database initialization scripts |
| initdb.scripts."create_databases.sql" | string | `"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"` | SQL script to create databases and users for all ATK services |
| nodeSelector | object | `{}` | Node labels for pod assignment (object) |
| persistence | object | `{"accessModes":["ReadWriteOnce"],"enabled":true,"size":"8Gi","storageClass":""}` | Persistence configuration |
| persistence.accessModes | list | `["ReadWriteOnce"]` | Access modes |
| persistence.enabled | bool | `true` | Enable persistence |
| persistence.size | string | `"8Gi"` | Storage size |
| persistence.storageClass | string | `""` | Storage class |
| podDisruptionBudget | object | `{"enabled":false,"minAvailable":1}` | Pod disruption budget configuration (object) |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget (bool) |
| podDisruptionBudget.minAvailable | int | `1` | Minimum number of available pods (int) |
| podSecurityContext | object | `{}` | Pod security context |
| postgresql | object | `{"database":"postgres","password":"atk","username":"postgres"}` | PostgreSQL configuration |
| postgresql.database | string | `"postgres"` | Default database name |
| postgresql.password | string | `"atk"` | Default superuser password |
| postgresql.username | string | `"postgres"` | Default superuser username |
| postgresql_conf | object | `{"checkpoint_completion_target":0.9,"default_statistics_target":100,"effective_cache_size":"1GB","effective_io_concurrency":200,"maintenance_work_mem":"64MB","max_connections":1000,"max_wal_size":"4GB","min_wal_size":"1GB","random_page_cost":1.1,"shared_buffers":"256MB","wal_buffers":"16MB","work_mem":"4MB"}` | PostgreSQL configuration parameters (object) |
| postgresql_conf.checkpoint_completion_target | float | `0.9` | Target for completion of checkpoint processing |
| postgresql_conf.default_statistics_target | int | `100` | Default statistics target for table columns |
| postgresql_conf.effective_cache_size | string | `"1GB"` | Planner's assumption about the effective size of the disk cache (string) |
| postgresql_conf.effective_io_concurrency | int | `200` | Number of concurrent disk I/O operations |
| postgresql_conf.maintenance_work_mem | string | `"64MB"` | Specifies the maximum amount of memory for maintenance operations |
| postgresql_conf.max_connections | int | `1000` | Maximum number of concurrent connections (int) |
| postgresql_conf.max_wal_size | string | `"4GB"` | Maximum size to which the WAL will grow during automatic checkpoints |
| postgresql_conf.min_wal_size | string | `"1GB"` | Minimum size to which the WAL will shrink |
| postgresql_conf.random_page_cost | float | `1.1` | Planner's assumption about the cost of a non-sequentially-fetched disk page |
| postgresql_conf.shared_buffers | string | `"256MB"` | Amount of memory dedicated to PostgreSQL to use for caching data (string) |
| postgresql_conf.wal_buffers | string | `"16MB"` | Amount of memory used in shared memory for WAL data |
| postgresql_conf.work_mem | string | `"4MB"` | Amount of memory to be used by internal sort operations and hash tables |
| resources | object | `{"limits":{"cpu":"500m","memory":"1Gi"},"requests":{"cpu":"100m","memory":"256Mi"}}` | Resource configuration |
| resources.limits | object | `{"cpu":"500m","memory":"1Gi"}` | Resource limits |
| resources.limits.cpu | string | `"500m"` | CPU limit |
| resources.limits.memory | string | `"1Gi"` | Memory limit |
| resources.requests | object | `{"cpu":"100m","memory":"256Mi"}` | Resource requests |
| resources.requests.cpu | string | `"100m"` | CPU request |
| resources.requests.memory | string | `"256Mi"` | Memory request |
| securityContext | object | `{}` | Container security context |
| service | object | `{"port":5432,"targetPort":5432,"type":"ClusterIP"}` | Service configuration |
| service.port | int | `5432` | Service port |
| service.targetPort | int | `5432` | Target port |
| service.type | string | `"ClusterIP"` | Service type |
| tolerations | list | `[]` | Tolerations for pod assignment (list) |
