// http://localhost
exports.GRAFANA_PROXY = process.env.GRAFANA_PROXY;
// 3333
exports.GRAFANA_PROXY_PORT = process.env.GRAFANA_PROXY_PORT;
// 3333 or 80 when using apache-proxy
exports.GRAFANA_PROXY_REDIRECT_PORT = process.env.GRAFANA_PROXY_REDIRECT_PORT
// /
exports.GRAFANA_PROXY_ROOT_URL = process.env.GRAFANA_PROXY_ROOT_URL;
// http://localhost
exports.GRAFANA_HOST = process.env.GRAFANA_HOST;
// 3000
exports.GRAFANA_PORT = process.env.GRAFANA_PORT;
// /grafana
exports.GRAFANA_ROOT_URL = process.env.GRAFANA_ROOT_URL;
// http://10.169.67.1
exports.ES_HOST = process.env.ES_HOST;
// 9200
exports.ES_PORT = process.env.ES_PORT;
// http://iot.comtrade.com
exports.KAPUA_HOST = process.env.KAPUA_HOST;
// 8081
exports.KAPUA_PORT = process.env.KAPUA_PORT;
// kapua-sys
exports.KAPUA_USER = process.env.KAPUA_USER;
// :)
exports.KAPUA_PASS = process.env.KAPUA_PASS;