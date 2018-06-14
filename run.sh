#!/bin/bash
#
docker run -d --name=grafana-poxy \
    -p 3000:3000 \
    -p 3333:3333 \
    -e "GRAFANA_PROXY=http://localhost" \
    -e "GRAFANA_PROXY_PORT=3333" \
    -e "GRAFANA_PROXY_REDIRECT_PORT=3333" \
    -e "GRAFANA_PROXY_ROOT_URL=/gp/" \
    -e "KAPUA_HOST=http://10.19.40.50" \
    -e "KAPUA_PORT=8080" \
    -e "ES_HOST=http://10.19.40.50" \
    -e "KAPUA_PASS=Rubikon3311#" \
    -e "GRAFANA_HOST=http://localhost" \
    -e "GRAFANA_PORT=3000" \
    -e "GRAFANA_ROOT_URL=/gp" \
    -e "GF_SERVER_PROTOCOL=http" \
    -e "GF_SERVER_DOMAIN=localhost" \
    -e "GF_SERVER_ROOT_URL=http://localhost:3000/gp" \
    -e "GF_SERVER_HTTP_PORT=3000" \
    grafana-proxy:latest
