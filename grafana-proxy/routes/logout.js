var express = require('express');
var router = express.Router();

var settings = require('../settings');

/* GET login page. */
router.get('/', function(req, res, next) {
    res.clearCookie('tokenId');
    res.clearCookie('username');
    res.render('login', { title: 'Grafana login', login_url: settings.GRAFANA_PROXY_ROOT_URL + 'grafana/login' });
});

module.exports = router;