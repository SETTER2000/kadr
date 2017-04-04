/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * res.negotiate() - является функцией, которая проверяет предоставленную ошибку (err) и
 * определяет соответствующее поведение обработки ошибок с помощью свойства status errors и
 * перенаправляет его в один из следующих ответов в словаре res: res.badRequest () [400 ошибок],
 * res.forbidden () [403 ошибки], res.notFound () [404 ошибки] или res.serverError () [500 ошибок].
 */
//var Emailaddresses = require('machinepack-emailaddresses');
var Passwords = require('machinepack-passwords');
var Gravatar = require('machinepack-gravatar');

var Email = require('machinepack-email');

// var Sugar = require('sugar');
module.exports = {
    /**
     * Авторизация. Проверка логина и пароля.
     *
     * @param req - запрос от клиента к серверу
     * @param res - ответ сервера клиенту
     */
    login: function (req, res) {
        User.findOne({
            or: [
                {email: req.param('email')},
                {login: req.param('email')}
            ]
        }, function foundUser(err, user) {
            if (err) return res.negotiate(err);
            if (!user) return res.notFound();
            require('machinepack-passwords').checkPassword({
                passwordAttempt: req.param('password'), encryptedPassword: user.encryptedPassword
            }).exec({
                error: function (err) {
                    return res.negotiate(err);
                },
                incorrect: function () {
                    return res.notFound();
                },
                success: function () {

                    if (user.deleted) {

                        return res.forbidden("'Your account has been deleted. " +
                            "Please visit ... restore to restore your account.'");

                    }
                    if (!user.action) {

                        return res.forbidden("Ваша учетная запись заблокирована, " +
                            "пожалуйста свяжитесь с администратором: apetrov@landata.ru");

                    }

                    //req.session.userId = user.id;
                    req.session.me = user;
                    return res.ok();
                }
            });
        });
    },

    profile: function (req, res) {

        // Try to look up user using the provided email address
        User.findOne(req.param('id')).exec(function foundUser(err, user) {
            // Handle error
            if (err) return res.negotiate(err);

            // Handle no user being found
            if (!user) return res.notFound();

            // Return the user
            return res.json(user);
        });
    },

    /**
     * Регистрация нового пользователя.
     */
    signup: function (req, res) {


        // Encrypt a string using the BCrypt algorithm.
        Passwords.encryptPassword({
            password: req.param('password'), difficulty: 10
        }).exec({
            // An unexpected error occurred.
            error: function (err) {
                return res.negotiate(err);
            }, // OK.
            success: function (encryptedPassword) {
                Gravatar.getImageUrl({
                    emailAddress: req.param('email')
                }).exec({
                    error: function (err) {
                        return res.negotiate(err);
                    },

                    success: function (gravatarUrl) {

                        User.create({
                            login: req.param('login'),
                            email: req.param('email'),
                            firstName: req.param('firstName'),
                            lastName: req.param('lastName'),
                            patronymicName: req.param('patronymicName'),
                            encryptedPassword: encryptedPassword,
                            birthday: req.param('birthday'),
                            contacts: req.param('contacts'),
                            subdivision: req.param('subdivision'),
                            position: req.param('position'),
                            pfr: req.param('pfr'),
                            dateInWork: req.param('dateInWork'),
                            lastLoggedIn: new Date(),
                            gravatarUrl: gravatarUrl
                        }, function userCreated(err, newUser) {
                            if (err) {
                                console.log('err:', err);
                                //console.log('err.invalidAttributes: ', err.invalidAttributes);
                                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.email[0].rule === 'unique') {
                                    return res.emailAddressInUse();
                                }
                                if (err.invalidAttributes && err.invalidAttributes.login && err.invalidAttributes.login[0] && err.invalidAttributes.login[0].rule === 'unique') {

                                    //console.log('err.invalidAttributes: ', err.invalidAttributes);
                                    //console.log('ERRRRR:: ', err);
                                    return res.loginInUse();
                                }

                                return res.negotiate(err);
                            }

                            req.session.me = newUser.id;
                            // res.redirect('/admin/users/edit/' + newUser.id);
                            // Отправка на email данных о регистрации
                            //Email.send(sails.config.sendMail).exec({
                            //    error: function (err) {
                            //        console.log(err);
                            //
                            //    }, success: function () {
                            //
                            //        console.log('Ok! Send mail.');
                            //    }
                            //});


                            return res.json(newUser);
                            //return res.json({
                            //    id: newUser.id
                            //});

                        });
                    }
                });
            }
        });

        // Send an email, either in plaintext or from an HTML template.
        //.where( actionUtil.parseCriteria(req) )
    },

    findOne: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('REGSESSIONME:');
        //console.log(req.session.me);
        User.findOne(req.param('id'))
            .exec(function foundUser(err, user) {
                if (err) return res.serverError(err);
                if (!user) return res.notFound();

                //User.message(user.id, {count: 12, hairColor: 'red'});
                //sails.sockets.broadcast('artsAndEntertainment', { greeting: 'Hola!' });
                //res.view({
                //    user: user, me: req.session.me
                //});

                res.view({
                    user: user,
                    me: req.session.me
                });
            });
    },

    show: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'), function foundUser(err, user) {
            if (err) return next(err);
            if (!user) return next();

            res.view({
                user: user, me: req.session.me
            });
        });
    },

    edit: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'), function foundUser(err, user) {

            if (err)return next(err);
            if (!user)return next('User doesn\'t exists.');
            //user.birthday = Sugar.Date.format(user.birthday, '%d.%m.%Y');
            res.view({
                user: user, me: req.session.me
            });
        });
    },

    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //User.findOne(req.param('id')).exec(function (err, user) {
        //    if (err)  return res.negotiate(err);
        //
        //    // Queue up a record to be inserted into the join table
        //    user.departments.add(req.param('subdivision'));
        //
        //    // Save the user, creating the new associations in the join table
        //    user.save(function (err) {
        //        return res.negotiate(err);
        //    });
        //});
        var obj = {
            login: req.param('login'),
            email: req.param('email'),
            firstName: req.param('firstName'),
            lastName: req.param('lastName'),
            patronymicName: req.param('patronymicName'),
            subdivision: req.param('subdivision'),
            birthday: req.param('birthday'),
            fired: req.param('fired'),
            dateInWork: req.param('dateInWork'),
            position: req.param('position'),
            contacts: req.param('contacts'),
            firedDate: req.param('firedDate'),
            action: req.param('action'),
            pfr: req.param('pfr')

        };
        User.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
            if (err) {
                return res.redirect('/admin/users/edit/' + req.param('id'));
            }
            if (req.param('subdivision')) {
                User.findOne(req.param('id')).exec(function (err, user) {
                    user.departments.add(req.param('subdivision'));
                    if (req.param('removeDivision')) {
                        user.departments.remove(req.param('removeDivision'));
                    }
                    user.save(function (err) {
                        if (err) return res.negotiate(err);
                        res.ok();
                    });
                });
            }
            if (req.param('position')) {
                User.findOne(req.param('id')).exec(function (err, user) {
                    user.positions.add(req.param('position'));
                    if (req.param('removePosition')) {
                        user.positions.remove(req.param('removePosition'));
                    }
                    user.save(function (err) {
                        if (err) return res.negotiate(err);
                        res.ok();
                    });
                });
            }

            res.ok();
            //res.view({
            //    user: user, me: req.session.me
            //});
            // User.publishUpdate(bobs[0].id, {
            //     hairColor: 'red'
            // }, req, {
            //     previous: {
            //         hairColor: bobs[0].hairColor
            //     }
            // });
        });
    },

    destroy: function (req, res, next) {
        User.findOne(req.param('id'), function foundUser(err, user) {
            if (err)return next(err);
            if (!user)return next('User doesn\'t exists.');
            User.destroy(req.param('id'), function userDestroyed(err) {
                if (err)return next(err);
            });
            // res.redirect('/admin/users');
            res.ok();
        });
    },

    logout: function (req, res) {
        User.findOne(req.session.me, function foundUser(err, user) {
            //if (err) return res.view('public/header', {layout: 'homepage'});
            if (err) return res.negotiate(err);
            if (!user) {
                sails.log.verbose('Сессия относится к пользователю, который больше не существует/');
                return res.backToHomePage();
            }
            req.session.me = null;
            return res.backToHomePage();
        });
    },

    removeProfile: function (req, res) {

        if (!req.param('id')) {
            return res.badRequest('id is a required parameter.');
        }

        User.update({
            id: req.param('id')
        }, {
            deleted: true
        }, function (err, removedUser) {

            if (err) return res.negotiate(err);
            if (removedUser.length === 0) {
                return res.notFound();
            }
            req.session.me = null;
            return res.ok();
        });
    },

    restoreProfile: function (req, res) {

        User.findOne({
            email: req.param('email')
        }, function foundUser(err, user) {
            if (err) return res.negotiate(err);
            if (!user) return res.notFound();

            Passwords.checkPassword({
                passwordAttempt: req.param('password'),
                encryptedPassword: user.encryptedPassword
            }).exec({

                error: function (err) {
                    return res.negotiate(err);
                },

                incorrect: function () {
                    return res.notFound();
                },

                success: function () {
                    User.update({
                        id: user.id
                    }, {
                        deleted: false
                    }).exec(function (err, updatedUser) {
                        req.session.me = user.id;
                        return res.json(updatedUser);
                    });
                }
            });
        });
    },

    restoreGravatarURL: function (req, res) {

        try {

            var restoredGravatarURL = gravatarUrl = Gravatar.getImageUrl({
                emailAddress: req.param('email')
            }).execSync();

            return res.json(restoredGravatarURL);

        } catch (err) {
            return res.serverError(err);
        }
    },

    updateProfile: function (req, res) {

        User.update({
            id: req.param('id')
        }, {
            gravatarUrl: req.param('gravatarUrl')
        }, function (err, updatedUser) {

            if (err) return res.negotiate(err);

            return res.json(updatedUser);

        });
    },

    changePassword: function (req, res) {

        if (_.isUndefined(req.param('password'))) {
            return res.badRequest('A password is required!');
        }

        if (req.param('password').length < 6) {
            return res.badRequest('Password must be at least 6 characters!');
        }

        Passwords.encryptPassword({
            password: req.param('password')
        }).exec({
            error: function (err) {
                return res.serverError(err);
            },
            success: function (encryptedPassword) {

                User.update({id: req.param('id')}, { encryptedPassword: encryptedPassword})
                    .exec(function (err, updatedUser) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    return res.json(updatedUser);
                });
            }
        });
    },

    adminUsers: function (req, res) {

        User.find({limit:1000,sort:'lastName'}).exec(function (err, users) {

            if (err) return res.negotiate(err);

            return res.json(users);

        });
    },

    updateAdmin: function (req, res) {
        User.update(req.param('id'), {
            admin: req.param('admin')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    updateKadr: function (req, res) {
        User.update(req.param('id'), {
            kadr: req.param('kadr')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    updateBanned: function (req, res) {
        User.update(req.param('id'), {
            banned: req.param('action')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    updateDeleted: function (req, res) {
        User.update(req.param('id'), {
            deleted: req.param('deleted')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    }
};

