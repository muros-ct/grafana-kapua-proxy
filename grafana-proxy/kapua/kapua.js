/**
 * Kapua module.
 *
 * @module kapua/kapua
 */

var request = require('request');

var settings = require('../settings');
var KAPUA_URL = settings.KAPUA_HOST + ':' + settings.KAPUA_PORT;

/**
 * Perform login to Kapua.
 *
 * @param username
 * @param password
 * @param callback
 */
exports.login = function (username, password, callback) {

    console.log('Login ' + username);

    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/json',
        'Accept':           'application/json'
    }

    // Configure the request
    var options = {
        url:        KAPUA_URL + '/v1/authentication/user',
        method:     'POST',
        headers:    headers,
        json: {
            'username': username,
            'password': password
        }
    }

    request(options, function (error, response, body) {

        console.log('Error ' + error);
        if (!error && response.statusCode == 200) {
            console.log("Login OK for user " +  username);
            callback(body.tokenId, body.userId, body.scopeId);
        } else {
            console.log("Login failed " + response.statusCode);
            callback(-1,-1,-1);
        }
    })
}

/**
 * Check if user has data access rights (datastore:read).
 *
 * @param tokenId
 * @param callback
 */
exports.checkDataAccess = function(tokenId, callback) {

    console.log('Data access check.');

    // Set the headers
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Authorization':    'Bearer ' + tokenId
    }

    // Configure the request
    var options = {
        url:        KAPUA_URL + '/v1/_/data/messages?offset=0&limit=1',
        method:     'GET',
        headers:    headers
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

/**
 * Get name of account specified by account id. Access to account data
 * is based on kapua-sys user, that has necessary privileges.
 *
 * @param accountId kapua account id
 * @param callback return name of account as single parameter
 */
exports.getAccountName = function(accountId, callback) {

    console.log('Get account for account id ' +  accountId);

    // Set the headers for authentication
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/json',
        'Accept':           'application/json'
    }

    // Configure authentication request
    var options = {
        url:        KAPUA_URL + '/v1/authentication/user',
        method:     'POST',
        headers:    headers,
        json: {
            'username': settings.KAPUA_USER,
            'password': settings.KAPUA_PASS
        }
    }

    // Start authentication request
    request(options, function (error, response, body) {

        console.log('getAccoutnName authentication called ' +  error + ', ' + response.statusCode);
        if (!error && response.statusCode == 200) {

            var headersAcc = {
                'User-Agent':       'Super Agent/0.0.1',
                'Content-Type':     'application/json',
                'Accept':           'application/json',
                'Authorization':    'Bearer ' + body.tokenId
            }

            var optionsAcc = {
                url:        KAPUA_URL + '/v1/_/accounts/' + accountId,
                method:     'GET',
                headers:    headersAcc
            }

            request(optionsAcc, function (errorAcc, responseAcc, bodyAcc) {
                var data = JSON.parse(bodyAcc)

                console.log('Found account with name ' +  data.name);
                callback(data.name);
            })
        }
    })
}