var express = require('express');
var router = express.Router();

/* GET error page and redirect. */
router.get('/', function(req, res, next) {
    res.render('error', { title: 'Ups' });
});

module.exports = router;