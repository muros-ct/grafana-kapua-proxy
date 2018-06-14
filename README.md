# Grafana - Kapua Proxy

Simple demonstration of autorization proxy for Grafana.

Proxy is implemented in Node.js and provides custom logic that integrates
Grafana with Eclipse Kapua IoT.

Use case is:

- User logs into Grafana using Kapua user and credentials.
- User permissions on Kapua data are evaluated.
- Data source in Kapua is Elasticsearch index. This data source is created in Grafana
  on per Kapua Account base.
- User can use this data source to create dashboards in Grafana.

Docker container is created that is based on Grafana docker with added proxy.

This container can be used either locally or behind Apache reverse proxy. 