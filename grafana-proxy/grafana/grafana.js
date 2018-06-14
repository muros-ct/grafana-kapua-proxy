/**
 * Grafana module
 * Used to access grafana resources through REST API interface.
 * It contains methods for resource check and creation.
 *
 * @module grafana/grafana
 */

var request = require('request');

var settings = require('../settings');
var GRAFANA_URL = settings.GRAFANA_HOST + ':' + settings.GRAFANA_PORT;
var ES_URL = settings.ES_HOST + ':' + settings.ES_PORT + '/';

/**
 * Perform initial checks and creation of resources.
 * 1. It checks for organization which user account belongs to, if organization
 * doesn't exist it creates one.
 * 2. Check for data source in this organization. Each organization has one data
 * source that is connected to account in kapua. This data source is Elasticsearch
 * based index. All users in account and consequently in organizatin in grafana have
 * same data source. If data source doesn't exist it creates one.
 *
 * @param orgName kapua account name used as organization name in Grafana
 * @param accountId kapua account id used for data source creation
 * @param callback true if operation was successful
 */
exports.initAccount = function(orgName, accountId, userName, callback) {

    console.log('Grafana account initialization for ' + orgName);

    initOrganization(orgName, function(success, orgId) {
        if (success) {
            initUser(orgId, userName, function(success, userId){
                if (success) {
                    initDataSource(accountId, orgId, orgName, function(success) {
                        callback(success);
                    });
                } else {
                    callback(false)
                }
            });
        } else {
            callback(false);
        }
    });
}

initOrganization = function(organizationName, callback) {

    console.log('Initialize organization ' +  organizationName);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/orgs/name/' + organizationName,
        method:     'GET',
        headers:    headers
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Organization exists
            var data = JSON.parse(body);
            callback(true, data.id)
        } else if (!error && response.statusCode == 404) {
            // Organization doesn't exist
            createOrganization(organizationName, function(success, orgId){
                if (success) {
                    callback(success, orgId)
                } else {
                    callback(false);
                }
            });
        } else {
            // Other errors
            callback(false);
        }
    });
}

createOrganization = function(organizationName, callback) {

    console.log('Creating organization ' + organizationName);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/orgs',
        method:     'POST',
        headers:    headers,
        json:       {'name': organizationName}
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Organization created
            callback(true, body.orgId)
        } else {
            // Other errors
            callback(false);
        }
    });
}

initUser = function(orgId, userName, callback) {

    console.log('Initializing user ' +  userName);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/users/lookup?loginOrEmail=' + userName,
        method:     'GET',
        headers:    headers
    }

    request(options, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            // User exists add him to organization
            var data = JSON.parse(body)
            addUserToOrganization(orgId, userName, function(success) {
                switchOrganizationForUser(data.id, orgId, function (success) {
                    callback(success);
                });
            })
        } else if (!error && response.statusCode == 404) {
            // User doesn't exist
            createUser(userName, function(success, userId){
                if (success) {
                    // User created, add him to organization
                    addUserToOrganization(orgId, userName, function(success) {
                        if (success) {
                            removeUserFromOrganization(1, userId, function(success) {
                                switchOrganizationForUser(userId, orgId, function (success) {
                                    callback(success);
                                });
                            });
                        } else {
                            callback(false)
                        }
                    });
                } else {
                    callback(false);
                }
            });
        } else {
            // Other errors
            callback(false);
        }
    });
}

createUser = function(userName, callback) {

    console.log('Creating user ' + userName);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/admin/users',
        method:     'POST',
        headers:    headers,
        json: {
            "name":         userName,
            "email":        "user@graf.com",
            "login":        userName,
            "password":     "Ah32fe12.#"
        }
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // User created
            callback(true, body.id)
        } else {
            callback(false);
        }
    });
}

addUserToOrganization = function(orgId, userName, callback) {

    console.log('Adding user ' +  userName + ' to organization with id ' +  orgId);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/orgs/' + orgId + '/users',
        method:     'POST',
        headers:    headers,
        json: {
            'loginOrEmail':     userName,
            'role':             'Editor'
        }
    }

    request(options, function (error, response, body) {

        // 409 already in organization
        if (!error && ((response.statusCode == 200) || (response.statusCode == 409))) {
            // User organization changed
            switchOrganizationForUser(1, orgId, function (success) {
                callback(success);
            });
        } else {
            callback(false);
        }
    });
}

removeUserFromOrganization = function(orgId, userId, callback) {

    console.log('Removing user with id ' +  userId + ' from organization with id ' +  orgId);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/orgs/' + orgId + '/users/' +  userId,
        method:     'DELETE',
        headers:    headers
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // User deleted from organization
            callback(true)
        } else {
            callback(false);
        }
    });
}

/**
 * Check if data source with name equal to account id exists and if not
 * create one. Data source is added to organization.
 *
 * @param accountId account id that is part of ES index name and also name of data source
 * @param orgId organization to which data source is added
 * @param callback success or failure
 */
initDataSource = function(accountId, orgId, orgName, callback) {

    console.log('Initialize datasource for account with id ' +  accountId);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/datasources/name/' + orgName + "DataSource",
        method:     'GET',
        headers:    headers
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Data source exists
            callback(true);
        } else if (!error && response.statusCode == 404) {
            // Data source doesn't exist
            switchOrganizationForUser(1, orgId, function (success) {
                if (success) {
                    createDataSource(accountId, orgId, orgName, function(success){
                        switchOrganizationForUser(1, orgId, function (success) {
                            callback(success);
                        });
                    });
                } else {
                    callback(false);
                }
            });
        } else {
            // Other errors
            callback(false);
        }
    });
}

createDataSource = function(accountId, orgId, orgName, callback) {

    console.log('Creating data source for account with id ' + accountId + ' in organization with id ' + orgId);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/datasources',
        method:     'POST',
        headers:    headers,
        json: {
            "orgId":                orgId,
            "name":                 orgName + "DataSource",
            "type":                 "elasticsearch",
            "access":               "proxy",
            "url":                  ES_URL,
            "password":             "",
            "user":                 "",
            "database":             "[" + accountId.toString() + "]" + "-YYYY-WW",
            "basicAuth":            false,
            "basicAuthUser":        "",
            "basicAuthPassword":    "",
            "jsonData": {
                "esVersion": 5,
                "interval": "Weekly",
                "keepCookies": [],
                "maxConcurrentShardRequests": 256,
                "timeField": "captured_on"
            }
        }
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Data source created
            callback(true)
        } else {
            // Other errors
            callback(false);
        }
    });
}

switchOrganizationForUser = function(userId, orgId, callback) {

    console.log('Switching user with id ' +  userId + ' to organization with id ' +  orgId);

    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-WEBAUTH-USER':   'admin'
    }

    var options = {
        url:        GRAFANA_URL + '/api/users/' + userId + '/using/' +  orgId,
        method:     'POST',
        headers:    headers
    }

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            // Organization changed
            callback(true);
        } else {
            // Other errors
            callback(false);
        }
    });
}