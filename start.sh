#!/bin/bash
#
# Start Grafana
/run.sh &
# Start Proxy
npm start > grafana_proxy.out
