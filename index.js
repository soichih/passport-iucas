var url = require('url'),
    util = require('util'),
    https = require('https'),
    passport = require('passport')

function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) { throw new Error('IU cas authentication strategy requires a verify function'); }

    this.casURL = "https://cas.iu.edu/cas";
    this.service = options.service || 'IU';
    this.serviceURL = options.serviceURL; //optional - if not set, authenticate will use current URL

    passport.Strategy.call(this);
    this.name = 'iucas';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}
util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function (req, options) {
    options = options || {};
    if(this.serviceURL) {
        var serviceURL = this.serviceURL;
    } else {
        //use the current url
        var serviceURL = req.protocol + '://' + req.get('host') + req.originalUrl;
    }

    var self = this;

    function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        //console.log("calling verified success");
        self.success(user, info);
    };

    //handling logout?
    var relayState = req.query.RelayState;
    if (relayState) {
        console.log("handling logout");
        req.logout();
        return this.redirect(this.casURL+'/logout');
    }

    //redirect to cas for the first time
    if (!req.query.casticket) {
        var redirectURL = url.parse(this.casURL+'/login');
        redirectURL.query = {
            cassvc: this.service, 
            casurl: serviceURL
        };
        return this.redirect(url.format(redirectURL));
    }

    //got ticket! validate it.
    var validateURL = url.parse(this.casURL+'/validate');
    validateURL.query = {
        cassvc: this.service, 
        casticket: req.query.casticket,
        casurl: serviceURL
    }
    https.get(url.format(validateURL), function(res) {
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {
            var lines = body.split('\n');
            if(lines[0].indexOf('yes') !== 0) {
                verified(new Error('Authentication failed'));
            } else {
                var username = lines[1].trim();
                if(self._passReqToCallback) { 
                    self._verify(req, username, verified);
                } else {
                    self._verify(username, verified);
                }
            }
        });
    }).on('error', function(e) {;
        self.error(new Error(e));
    });
};

exports.Strategy = Strategy;
