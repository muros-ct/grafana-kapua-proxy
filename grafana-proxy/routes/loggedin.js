var express = require('express');
var router = express.Router();

/* GET logedin page and redirect. */
router.get('/', function(req, res, next) {
    res.render('loggedin', { redirect_url: 'http://localhost:3333/' });
});

module.exports = router;