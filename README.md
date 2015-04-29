# passport-iucas

Indiana University CAS authentication strategies for Passport.

## Install

    $ npm install passport-iucas

#### Configure Strategy

    var iucas_strategy = new iucas.Strategy(function(username, done) {
        //TODO - lookup user from specified username
        return done(null, {id: username, email: 'user@email.com'});
    });
    passport.use(iucas_strategy);

#### Authenticate Requests

    //access this to login via IU CAS
    app.use('/protected', passport.authenticate('iucas', { failureRedirect: '/iucas/fail' }), function(req, res, next) {
        //user object can be accessed via req.user
        //render your protected content
    });

#### req.user

In order to access the req.user from other pages, you will need to persist it using express-session. Please see /test/app.js for example.

## License

[The MIT License](http://opensource.org/licenses/MIT)
