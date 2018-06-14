#!/bin/bash
#
docker build -t grafana-proxy .
docker tag grafana-proxy upumesar/grafana-proxy
docker push upumesar/grafana-proxy
