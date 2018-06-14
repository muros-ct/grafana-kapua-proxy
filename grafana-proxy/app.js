var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var kapua = require('./kapua/kapua')
var grafana = require('./grafana/grafana')

var loginRouter = require('./routes/login');
var loggedinRouter = require('./routes/loggedin');
var logoutRouter = require('./routes/logout')
var errorRouter = require('./routes/error');

var bigInt = require("big-integer");

var settings = require("./settings");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(settings.GRAFANA_PROXY_ROOT_URL + 'login', loginRouter);
app.use(settings.GRAFANA_PROXY_ROOT_URL + 'loggedin', loggedinRouter);
app.use(settings.GRAFANA_PROXY_ROOT_URL + 'logout', logoutRouter);
app.use(settings.GRAFANA_PROXY_ROOT_URL + 'error', errorRouter);

app.post(settings.GRAFANA_PROXY_ROOT_URL + 'grafana/login', function(req, res){
    var user = {
        username : req.body.username,
        password : req.body.password
    }

    // check if client sent cookie
    var cookie = req.cookies.tokenId;
    if (cookie === undefined) {
        // no: set a new cookie
        kapua.login(user.username, user.password, function(tokenId, userId, accountId) {
            if (tokenId == -1) {
                res.redirect(settings.GRAFANA_PROXY + ':' + settings.GRAFANA_PROXY_REDIRECT_PORT + settings.GRAFANA_PROXY_ROOT_URL + 'login');
            } else {
                res.cookie('tokenId',tokenId, { maxAge: 3000000, httpOnly: true });
                res.cookie('username', user.username, { maxAge: 3000000, httpOnly: true });
                kapua.getAccountName(accountId, function(orgName) {
                    var decoded = new Buffer(accountId, 'base64');
                    var multiplier = bigInt(1)
                    var result = bigInt(0);
                    for (var i = decoded.length-1; i >= 0; i-- ) {
                        result = result.add(multiplier.multiply(decoded[i]));
                        multiplier = multiplier.multiply(256);
                    }
                    grafana.initAccount(orgName, result, user.username, function (success) {
                        console.log('Init account success ' + success);
                        if (success) {
                            res.render('loggedin', { redirect_url:  settings.GRAFANA_PROXY + ':' + settings.GRAFANA_PROXY_REDIRECT_PORT + settings.GRAFANA_PROXY_ROOT_URL});
                        } else {
                            // TODO report error
                            res.render('error', { error_msg: 'Unknown error.',
                                url: settings.GRAFANA_PROXY + ':' + settings.GRAFANA_PROXY_REDIRECT_PORT + settings.GRAFANA_PROXY_ROOT_URL + '/login'});
                        }
                    });
                });
            }
        })
    } else {
        // yes, cookie was already present
        console.log('cookie exists', cookie);
        res.redirect(settings.GRAFANA_PROXY + ':' + settings.GRAFANA_PROXY_REDIRECT_PORT + settings.GRAFANA_PROXY_ROOT_URL);
    }

});

module.exports = app;
