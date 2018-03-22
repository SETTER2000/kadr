'use strict';
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
const ObjectId = require('mongodb').ObjectId;
const Passwords = require('machinepack-passwords');
const Gravatar = require('machinepack-gravatar');
const _ = require('lodash');
const Email = require('machinepack-email');
const ldap = require('ldapjs');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const keygen = require("keygenerator");

/*
 * Default configuration
 *
 * chars: true
 * sticks: false
 * numbers: true
 * specials: false
 * sticks: false
 * length: 8
 * forceUppercase: false
 * forceLowercase: false
 * exclude:[ ]
 *
 */

moment.locale('ru');
//var URI = require('urijs');
//const URITemplate = require('urijs/src/URITemplate');
var count = 5;

module.exports = {

    /**
     * Получить всех пользователей системы
     * @param req
     * @param res
     */
    get: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        if (req.param('id')) {
            User.findOne(req.param('id'))
                .populate('vacations')
                .populate('interfaces')
                .populate('matchings')
                .populate('announced')
                .populate('intersections')
                .populate('iagree')
                .exec(function foundUser(err, user) {
                    if (err) return res.serverError(err);
                    if (!user) return res.notFound();
                    console.log('GET OBJECT USER перед отдачей из DB', user);
                    user.formatDate();
                    //user.birthday = ( user.birthday) ? moment( user.birthday).format('DD.MM.YYYY') : null;
                    console.log('GET OBJECT USER перед отдачей из DB c исправленной датой:', user);
                    res.ok(user);

                });
        }
        else {
            if (!_.isUndefined(req.param('where')) && req.param('char').length > 0) {
                var q = {
                    limit: req.param('limit'),
                    sort: req.param('sort')
                };
                var y = {};
                y[req.param('property')] = {'like': req.param('char')};
                q.where = y;
                //
                //console.log('REG all+ User',req.params.all());
                //console.log('QUERY', q);
                //
                User.find(q)
                    .populate('positions')
                    .populate('vacations')
                    .populate('interfaces')
                    .populate('matchings')
                    .populate('announced')
                    .populate('intersections')
                    .populate('iagree')
                    .exec(function foundUser(err, users) {
                        if (err) return res.serverError(err);
                        if (!users) return res.notFound();

                        //console.log('OK 0', users[0]);
                        //console.log('OK length', users.length);
                        return res.ok(users);
                    });
            } else {

                User.find()
                    .populate('positions')
                    .populate('vacations')
                    .populate('interfaces')
                    .populate('matchings')
                    .populate('announced')
                    .populate('intersections')
                    .populate('iagree')
                    .exec(function foundUser(err, users) {
                        if (err) return res.serverError(err);
                        if (!users) return res.notFound();
                        res.ok(users);
                    });
            }
        }
    },


    /**
     * Получить конкретного пользователя
     * @param req
     * @param res
     */
    findOne: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('positions')
            .populate('interfaces')
            .populate('matchings')
            .populate('announced')
            .populate('iagree')
            .exec(function foundUser(err, user) {
                if (err) return res.serverError(err);
                if (!user) return res.notFound();
                res.ok(user);
            });
    },


    /**
     * Авторизация. Проверка логина и пароля.
     *
     * @param req
     * @param res
     */
    login: function (req, res) {
        User.findOne({
            or: [
                {email: req.param('email')},
                {login: req.param('email')}
            ]
        }).exec((err, user)=> {
            if (err) return res.negotiate(err);
            if (!user) return res.notFound();
            Passwords.checkPassword({
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
                        return res.forbidden("Ваша учетная запись удалена. " +
                            "Перейдите на страницу 'Восстановить профиль'.");
                    }
                    if (!user.action) {
                        return res.forbidden("Ваша учетная запись заблокирована, " +
                            "пожалуйста свяжитесь с администратором: " + sails.config.admin.email);
                    }

                    req.session.me = user.id;
                    //req.session.admin = user.admin;
                    //req.session.kadr = 11;
                    //req.session.me = user;
                    return res.ok();
                }
            });
        });
    },

    /**
     * Авторизация LDAP. Проверка логина и пароля.
     *
     * @param req - запрос от клиента к серверу
     * @param res - ответ сервера клиенту
     */
    loginLDAP: function (req, res) {
        User.findOne({
                or: [
                    {email: req.param('email')},
                    {login: req.param('email')}
                ]
            })
            .populate('positions')
            .populate('interfaces')
            .populate('vacations')
            .populate('departments')
            .populate('vacationWhomCreated')
            .populate('vacationWhomUpdated')
            .exec((err, user)=> {
                if (err) return res.negotiate(err);
                if (!user) return res.notFound('Пользователь не найден.');

                if (user.deleted) {
                    return res.forbidden("Ваша учетная запись удалена. " +
                        "Перейдите на страницу 'Восстановить профиль'.");
                }
                if (!user.action) {
                    return res.forbidden("Ваша учетная запись заблокирована, " +
                        "пожалуйста свяжитесь с администратором: " + sails.config.admin.email);
                }

                const clientLDAP = ldap.createClient({
                    url: sails.config.ldap.uri
                });

                var opts = {
                    scope: 'sub',
                    filter: '(sAMAccountName=' + user.login + ')',
                    attributes: sails.config.ldap.attributes,
                    reconnect: false
                    //paged: true,
                    //sizeLimit: 50
                    //idleTimeout: 3000
                };

                /**
                 * Соединение с сервером LDAP
                 */
                clientLDAP.bind(user.login + '@' + sails.config.admin.company, req.param('password'), function (err) {
                    if (err) {
                        sails.log.warn('LDAP ошибка входа: ', user.login + '@' + sails.config.admin.company + ' ' + req.param('password'));
                        clientLDAP.unbind(function () {
                            clientLDAP.destroy();
                        });
                        --count;
                        if (+count < 0)  return res.forbidden('Аккаунт заблокирован! Обращайтесь к системному администратору или через 10 мин. блокировка будет снята автоматически.');
                        switch (+count) {
                            case 1:
                                word = 'попытка';
                                break;
                            case 0:
                                word = 'попыток';
                                break;
                            default:
                                var word = 'попытки';
                        }
                        return res.forbidden('Не верный логин или пароль. У вас осталось ' + count + ' ' + word + '.');
                    }
                    clientLDAP.search(sails.config.ldap.dn, opts, function (err, ldapUser) {
                        if (err) {
                            console.log('LDAP ошибка поиска: ', err);
                            return res.negotiate(err);
                        }

                        ldapUser.on('searchEntry', function (entry) {
                            sails.log.info('Вход в систему: ' + new Date() + ', ' +
                                JSON.stringify(entry.object.displayName + ', ' +
                                    entry.object.department + ', ' + entry.object.title + ', ' +
                                    entry.object.telephoneNumber + ', ' + entry.object.mail + ', ' +
                                    entry.object.physicalDeliveryOfficeName + ', Руководитель: ' +
                                    entry.object.manager));
                            count = 5;
                        });

                        //ldapUser.on('searchReference', function (referral) {
                        //    console.log('referral: ' + referral.uris.join());
                        //});

                        ldapUser.on('error', function (err) {
                            //if (err) return res.forbidden('Ошибка поиска в соединение LDAP: ' + err.message);
                            console.warn('LDAP connection failed, but fear not, it will reconnect No', err);
                        });

                        ldapUser.on('end', function (result) {
                            if (result.status == 0) {
                                req.session.me = user.id;
                                clientLDAP.unbind(function () {
                                    clientLDAP.destroy();
                                });
                                return res.ok();
                            }
                            return res.forbidden(result.errorMessage);
                        });
                    });
                });
            });
    },

    /**
     * Поиск пользователей по LDAP
     * @param req
     * @param res
     */
    searchLDAP: function (req, res) {
        console.log('Поиск пользователя в LDAP: ', req.param('name'));
        const clientSearchLDAP = ldap.createClient({
            url: sails.config.ldap.uri
        });
        let opts = {
            scope: 'sub',
            filter: '(displayName=' + req.param('name') + '*)',
            //filter: '(mail=apetrov@landata.ru)',
            //filter: '(sAMAccountName=' + user.login + ')',
            attributes: sails.config.ldap.attributes,
            reconnect: false
            //paged: true,
            //sizeLimit: 50
        };
        /**
         * Соединение с сервером LDAP
         */
        clientSearchLDAP.bind(sails.config.ldap.username, sails.config.ldap.password, function (err) {
            if (err) {
                console.log('searchLDAP ошибка входа: ', err);
                clientSearchLDAP.unbind(function () {
                    clientSearchLDAP.destroy();
                });

                //--count;
                //if (+count < 0)  return res.forbidden('Аккаунт заблокирован! Обращайтесь к системному администратору.');
                //switch (+count) {
                //    case 1:
                //        word = 'попытка';
                //        break;
                //    case 0:
                //        word = 'попыток';
                //        break;
                //    default:
                //        var word = 'попытки';
                //}
                return res.forbidden('searchLDAP: Не верный логин или пароль. ');
            }
            var userAr = [];

            /**
             * Поиск по dn
             */
            clientSearchLDAP.search(sails.config.ldap.dn, opts, function (err, ldapUser) {
                if (err) {
                    console.log('searchLDAP ошибка поиска: ', err);
                    return res.negotiate(err);
                }
                ldapUser.on('searchEntry', function (entry) {
                    //console.log('entry: ' + JSON.stringify(entry.object));
                    userAr.push(entry.object);
                });

                ldapUser.on('error', function (err) {
                    console.error('ОШибка-222: ' + err.message);
                });

                ldapUser.on('end', function (result) {
                    if (result.status == 0) {
                        if (!userAr.length) {
                            clientSearchLDAP.unbind(function () {
                                clientSearchLDAP.destroy();
                            });
                            return res.notFound('Нет таких!');
                        }
                        clientSearchLDAP.unbind(function () {
                            clientSearchLDAP.destroy();
                        });
                        return res.ok(userAr);
                    }
                    return res.forbidden(result.errorMessage);
                });

            });
        });


    },

    /**
     * Поиск руководителя в LDAP
     */
    bossLDAP: function (req, res) {
        sails.log.info('Поиск руководителя в LDAP для сотрудника: ', req.param('lastName') + ' ' + req.param('firstName') + ' ' + req.param('patronymicName'));
        const clientSearchLDAP = ldap.createClient({
            url: sails.config.ldap.uri
        });
        let opts = {
            scope: 'sub',
            filter: '(displayName=' + req.param('lastName') + ' ' + req.param('firstName') + ' ' + req.param('patronymicName') + ')',
            //filter: '(mail=apetrov@landata.ru)',
            //filter: '(sAMAccountName=' + user.login + ')',
            attributes: sails.config.ldap.attributes,
            reconnect: false
            //paged: true,
            //sizeLimit: 50
        };
        /**
         * Соединение с сервером LDAP
         */
        clientSearchLDAP.bind(sails.config.ldap.username, sails.config.ldap.password, function (err) {
            if (err) {
                sails.log.warn('searchLDAP ошибка входа: ', sails.config.ldap.username + ' ' + sails.config.ldap.password);
                clientSearchLDAP.unbind(function () {
                    clientSearchLDAP.destroy();
                });

                //--count;
                //if (+count < 0)  return res.forbidden('Аккаунт заблокирован! Обращайтесь к системному администратору.');
                //switch (+count) {
                //    case 1:
                //        word = 'попытка';
                //        break;
                //    case 0:
                //        word = 'попыток';
                //        break;
                //    default:
                //        var word = 'попытки';
                //}
                return res.forbidden('searchLDAP: Не верный логин или пароль. ');
            }
            var empl = '';

            /**
             * Поиск по dn
             */
            clientSearchLDAP.search(sails.config.ldap.dn, opts, function (err, ldapUser) {
                if (err) {
                    sails.log.warn('searchLDAP ошибка поиска: ', err);
                    return res.negotiate(err);
                }
                ldapUser.on('searchEntry', function (entry) {
                    sails.log.info('Найден руководитель в LDAP: ' + JSON.stringify(entry.object.manager));
                    empl = entry.object;
                });

                ldapUser.on('error', function (err) {
                    console.error('ОШибка-222: ' + err.message);
                });

                ldapUser.on('end', function (result) {
                    if (result.status == 0) {
                        if (empl.manager === undefined) {
                            clientSearchLDAP.unbind(function () {
                                clientSearchLDAP.destroy();
                            });
                            return res.ok();
                            //return res.ok({'lastName':'Директор!'});
                        }
                        clientSearchLDAP.unbind(function () {
                            clientSearchLDAP.destroy();
                        });
                        //console.log('Найден руководитель:', empl.manager);
                        // CN=Еремин Сергей,OU=Users,OU=Office users,DC=landata,DC=ru
                        if (!empl.manager) return res.forbidden(result.errorMessage);
                        let arr = empl.manager.split(',');
                        let arr2 = arr[0].split('=');
                        let arrFi = arr2[1].split(' ');
                        //console.log('arrFi', arrFi);
                        User.findOne({'lastName': arrFi[0], 'firstName': arrFi[1]})
                            .populate('positions')
                            .populate('interfaces')
                            .populate('vacations')
                            .populate('departments')
                            .populate('vacationWhomCreated')
                            .populate('vacationWhomUpdated')
                            .exec(function foundUser(err, user) {
                                if (err) return res.serverError(err);
                                if (!user) return res.notFound();
                                return res.ok(user);
                            });
                        //return res.ok(arr2[1]);

                        //return res.ok();
                    }
                    //return res.forbidden(result.errorMessage);
                });

            });
        });
    },

    /**
     * Регистрация нового пользователя.
     */
    signup: function (req, res) {
        Passwords.encryptPassword({
            password: req.param('password'), difficulty: 10
        }).exec({
            error: function (err) {
                return res.negotiate(err);
            },
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
                                gravatarUrl: gravatarUrl,
                                avatar: req.param('avatar'),
                                room: req.param('room')
                            },
                            function userCreated(err, newUser) {
                                if (err) {
                                    //console.log('err:', err);
                                    if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.email[0].rule === 'unique') {
                                        return res.emailAddressInUse();
                                    }
                                    if (err.invalidAttributes && err.invalidAttributes.login && err.invalidAttributes.login[0] && err.invalidAttributes.login[0].rule === 'unique') {
                                        //console.log('err.invalidAttributes: ', err.invalidAttributes);
                                        return res.loginInUse();
                                    }
                                    return res.negotiate(err);
                                }
                                req.session.me = newUser.id;
                                return res.json(newUser);
                            });
                    }
                });
            }
        });
    },

    /**
     * Создать нового пользователя
     * @param req
     * @param res
     */
    createUser: function (req, res) {

        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        if (!_.isString(req.param('lastName'))) {
            return res.badRequest('Фамилия не заполнена.');
        }
        if (!_.isString(req.param('firstName'))) {
            return res.badRequest('Имя не заполнено.');
        }
        if (!_.isString(req.param('patronymicName'))) {
            return res.badRequest('Отчество не заполнено.');
        }
        if (!_.isString(req.param('login'))) {
            return res.badRequest('Логин не заполнен.');
        }
        if (!_.isString(req.param('email'))) {
            return res.badRequest('Email не заполнен.');
        }

        if (req.param('patronymicName').length < 2 || req.param('patronymicName').length > 15) {
            return res.badRequest('Отчество должно быть от 2 до 15 знаков!');
        }
        if (req.param('firstName').length < 2 || req.param('firstName').length > 15) {
            return res.badRequest('Имя должно быть от 2 до 15 знаков!');
        }
        if (req.param('lastName').length < 2 || req.param('lastName').length > 15) {
            return res.badRequest('Фамилия должна быть от 2 до 15 знаков!');
        }
        let birthday = ( req.param('birthday')) ? new Date(moment(req.param('birthday'), ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
        let dateInWork = ( req.param('dateInWork')) ? new Date(moment(req.param('dateInWork'), ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
        console.log('CREATE ALL:', req.params.all());
        Passwords.encryptPassword({
            password: req.param('password'), difficulty: 10
        }).exec({
            error: function (err) {
                return res.negotiate(err);
            },
            success: function (encryptedPassword) {
                Interface.create({year: moment().year()})
                    .exec((err, createInterface)=> {
                        if (err) {
                            console.log('ОШибка в User.createUser', err);
                            return res.negotiate(err);
                        }
                        User.findOne(req.session.me).exec((err, userCreated)=> {
                            if (err) return res.negotiate(err);
                            if (!userCreated) return res.notFound('Вы не авторизованы!');
                            User.create({
                                action: req.param('action'),
                                login: req.param('login'),
                                email: req.param('email'),
                                firstName: req.param('firstName'),
                                lastName: req.param('lastName'),
                                lastNameChange: [{
                                    lastName: req.param('lastName'),
                                    changeDate: moment().format('DD.MM.YYYY HH:mm:ss'),
                                    whoChanged: userCreated.getFullName(),
                                    whoChangeId:req.session.me
                                }],
                                patronymicName: req.param('patronymicName'),
                                encryptedPassword: encryptedPassword,
                                birthday: birthday,
                                contacts: req.param('contacts'),
                                subdivision: req.param('subdivision'),
                                position: req.param('position'),
                                pfr: req.param('pfr'),
                                parking: req.param('parking'),
                                park: req.param('park'),
                                room: req.param('room'),
                                numCar: req.param('numCar'),
                                brandCar: req.param('brandCar'),
                                dateInWork: dateInWork,
                                lastLoggedIn: new Date(),
                                notice: [
                                    {name: 'Уведомление о начале сбора информации.', order: 1, value: true},
                                    {name: 'Дополнительное уведомление о не заполненной информации по отпуску.', oreder: 2, value: false}
                                ]
                                //gravatarUrl: gravatarUrl
                            }, function (err, newUser) {
                                if (err) {
                                    console.log('ERR create USER', err);
                                    return res.badRequest('Пользователь не создан!');
                                }
                                sails.log.info('Создан новый пользователь с логином:' + newUser.login);

                                newUser.interfaces.add(createInterface.id);
                                newUser.save(function (err) {
                                    if (err) return res.negotiate(err);
                                    sails.log.info('NEW USER:', newUser);
                                    res.send(newUser);
                                });
                            });
                        });
                    });
            }
        });
    },

    /**
     * Выход с сайта
     * @param req
     * @param res
     */
    logout: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.session.me, function foundUser(err, user) {
            //if (err) return res.view('public/header', {layout: 'homepage'});
            if (err) return res.negotiate(err);
            if (!user) {
                sails.log.warn('Сессия относится к пользователю, который больше не существует/');
                return res.backToHomePage();
            }
            req.session.me = null;
            sails.log.info('Выход из системы: ', new Date() + ', ' + user.lastName + ' ' + user.firstName + ' ' + user.patronymicName + ', ' + user.email);
            return res.backToHomePage();
        });
    },

    /**
     *  Восстановление пароля
     * @param req
     * @param res
     * @returns {*}
     */
    generateRecoveryEmail: function (req, res) {

        // secondary check for email parameter
        if (_.isUndefined(req.param('email'))) {
            return res.badRequest('Необходимо указать адрес электронной почты!');
        }

        // Find user by the incoming `email` parameter
        User.findOne({
            email: req.param('email')
        }).exec(function foundUser(err, user) {

            if (err) return res.negotiate(err);

            if (!user) return res.notFound();

            // Generate random alphanumeric string for the passwordRecoveryToken
            try {
                var randomString = Strings.random({}).execSync();
            } catch (err) {
                return res.serverError(err);
            }

            // Update user's paswordRecoveryToken attribute with the newly created alphanumeric string
            User.update({
                id: user.id
            }, {
                passwordRecoveryToken: randomString
            }).exec(function updateUser(err, updatedUser) {
                if (err) return res.negotiate(err);

                // email user with a URL which includes the password recovery token as a parameter

                // The Url that inclues the password recovery token as a parameter
                var recoverUrl = sails.config.mailgun.baseUrl + '/password-reset-form/' + updatedUser[0].passwordRecoveryToken;

                var messageTemplate = 'Восстановление пароля! \n' +
                    '\n' +
                    'Для сброса пароля, воспользуйтесь следующей ссылкой: \n' +
                    recoverUrl + '\n' +
                    '\n' +
                    'Удачи.';

                // Send a simple plaintext email.
                Mailgun.sendPlaintextEmail({
                    apiKey: sails.config.mailgun.apiKey,
                    domain: sails.config.mailgun.domain,
                    toEmail: updatedUser[0].email,
                    subject: '[KADR] Сброс пароля',
                    message: messageTemplate,
                    fromEmail: sails.config.admin.email,
                    fromName: sails.config.admin.name
                }).exec({
                    // An unexpected error occurred.
                    error: function (err) {
                        return res.negotiate(err);
                    },
                    success: function () {
                        return res.ok();
                    }
                });
            });
        });
    },

    /**
     * Сброс пароля при восстановлении
     * @param req
     * @param res
     * @returns {*}
     */
    resetPassword: function (req, res) {

        // check for token parameter
        if (!_.isString(req.param('passwordRecoveryToken'))) {
            return res.badRequest('A password recovery token is required!');
        }

        // secondary check for password parameter
        if (!_.isString(req.param('password'))) {
            return res.badRequest('A password is required!');
        }

        // Fallback to client-side length check validation
        if (req.param('password').length < 6) {
            return res.badRequest('Password must be at least 6 characters!');
        }

        // Try to find user with passwordRecoveryToken
        User.findOne({
            passwordRecoveryToken: req.param('passwordRecoveryToken')
        }).exec(function foundUser(err, user) {
            if (err) return res.negotiate(err);

            // If this token doesn't correspond with a real user record, it is invalid.
            // We send a 404 response so that our front-end code can show an
            // appropriate error message.
            if (!user) {
                return res.notFound();
            }

            // Encrypt new password
            Passwords.encryptPassword({
                password: req.param('password'),
            }).exec({
                error: function (err) {
                    return res.serverError(err);
                },
                success: function (encryptedPassword) {

                    User.update(user.id, {
                        encryptedPassword: encryptedPassword,
                        passwordRecoveryToken: null
                    }).exec(function (err, updatedUsers) {
                        if (err) {
                            return res.negotiate(err);
                        }

                        // Log the user in
                        req.session.userId = updatedUsers[0].id;

                        // If successful return updatedUsers
                        return res.json({
                            username: updatedUsers[0].username
                        });
                    });
                }
            });
        });
    },


    /**
     * Показать пользователя
     * @param req
     * @param res
     * @param next
     */
    show: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('matchings')
            .populate('announced')
            .populate('intersections')
            .populate('iagree')
            .exec((err, user) => {
                if (err) return next(err);
                if (!user) return next();

                res.view({
                    user: user, me: req.session.me
                });
            });
    },

    /**
     * Редактировать пользователя
     * @param req
     * @param res
     * @param next
     */
    edit: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.find(req.param('id'))
            .populate('positions')
            .populate('vacations')
            .populate('interfaces')
            .populate('matchings')
            .populate('announced')
            .exec((err, user) => {
                if (err)return next(err);
                if (!user)return next('User doesn\'t exists.');
                //user.birthday = Sugar.Date.format(user.birthday, '%d.%m.%Y');
                res.view({
                    user: user, me: req.session.me
                });
            });
    },

    /**
     * Обновить пользователя
     * @param req
     * @param res
     */
    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        User.findOne(req.session.me).exec((err, userUpdated)=> {
            if (err) return res.negotiate(err);
            if (!userUpdated) return res.notFound('Вы не авторизованы!');
            let objectChange = {
                lastName: req.param('lastName'),
                changeDate: moment().format('DD.MM.YYYY HH:mm:ss'),
                whoChanged: userUpdated.getFullName(),
                whoChangeId:req.session.me
            };
            let lastNameChange = (req.param('lastNameChange')) ? req.param('lastNameChange'): [];
            let ln = lastNameChange.length;
            if (_.isArray(req.param('lastNameChange')) && ln > 0) {
                if(lastNameChange[--ln].lastName !== req.param('lastName')) lastNameChange.push(objectChange);
            } else {
                lastNameChange.push(objectChange);
            }

            let fDt = (req.param('firedDate')) ? req.param('firedDate') : null;
            let birthday = ( req.param('birthday')) ? new Date(moment(req.param('birthday'), ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
            let dateInWork = ( req.param('dateInWork')) ? new Date(moment(req.param('dateInWork'), ['DD.MM.YYYY']).format('YYYY-MM-DD')) : null;
            var obj = {
                action: req.param('action'),
                login: req.param('login'),
                email: req.param('email'),
                firstName: req.param('firstName'),
                lastName: req.param('lastName'),
                lastNameChange: lastNameChange,
                patronymicName: req.param('patronymicName'),
                birthday: birthday,
                fired: req.param('fired'),
                dateInWork: dateInWork,
                decree: req.param('decree'),
                subdivision: req.param('subdivision'),
                position: req.param('position'),
                contacts: req.param('contacts'),
                firedDate: fDt,
                parking: req.param('parking'),
                park: req.param('park'),
                numCar: req.param('numCar'),
                brandCar: req.param('brandCar'),
                pfr: req.param('pfr'),
                avatarUrl: req.param('avatarUrl'),
                room: req.param('room'),
                furlough: req.param('furlough'),
                notice: req.param('notice')
            };
            User.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
                if (err)return res.redirect('/admin/users/edit/' + req.param('id'));
                User.findOne(req.param('id'))
                    .populate('vacations')
                    .populate('interfaces')
                    .exec(function (err, user) {
                        if (err) return res.negotiate(err);
                        if (!user) return res.notFound('Не могу');
                        //user.position.add(req.param('position'));

                        // if (_.isEmpty(req.param('position'))) {
                        //     user.positions.add({})
                        // }
                        //if (req.param('positionRemove')) {
                        //    user.position.remove(req.param('positionRemove'));
                        //}
                        //if (req.param('furloughRemove')) {
                        //    user.furloughs.remove(req.param('furloughRemove'));
                        //}
                        user.save(function (err) {
                            if (err) return res.negotiate('ERR: ' + err);
                            user.formatDate();
                            res.ok(user);
                        });
                    });
            });
        });
    },

    /**
     * Удалить пользователя
     * @param req
     * @param res
     * @param next
     */
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('positions')
            .populate('vacations')
            .populate('interfaces')
            .exec((err, user)=> {
                if (err)return next(err);
                if (!user)return next('User doesn\'t exists.');
                User.destroy(req.param('id'))
                    .exec((err) => {
                        if (err)return next(err);
                    });
                res.ok();
            });
    },

    /**
     * Удалить профиль
     * @param req
     * @param res
     */
    removeProfile: function (req, res) {

        //if (!req.param('id')) {
        //    return res.badRequest('id is a required parameter.');
        //}

        User.update({
            id: req.session.me
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

    /**
     * Восстановить профиль
     * @param req
     * @param res
     */
    restoreProfile: function (req, res) {

        User.findOne({
                email: req.param('email'),
                action: true
            },
            function foundUser(err, user) {
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
                            //console.log(updatedUser);
                            return res.json(updatedUser);
                        });
                    }
                });
            });
    },

    /**
     * Восстановить Gravatar
     * @param req
     * @param res
     * @returns {*}
     */
    restoreGravatarURL: function (req, res) {
        let gravatarUrl;
        try {

            var restoredGravatarURL = gravatarUrl = Gravatar.getImageUrl({
                emailAddress: req.param('email')
            }).execSync();

            return res.json(restoredGravatarURL);

        } catch (err) {
            return res.serverError(err);
        }
    },

    /**
     * Обновить профиль
     * @param req
     * @param res
     */
    updateProfile: function (req, res) {
        User.update({
            id: req.session.me
        }, {
            gravatarUrl: req.param('gravatarUrl')
        }, function (err, updatedUser) {
            if (err) return res.negotiate(err);
            return res.json(updatedUser);
        });
    },

    /**
     * Сменить пароль (функция для использования только админами)
     * @param req
     * @param res
     * @returns {*}
     */
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
                User.update({id: req.param('id')}, {encryptedPassword: encryptedPassword})
                    .exec(function (err, updatedUser) {
                        if (err) {
                            return res.negotiate(err);
                        }
                        return res.json(updatedUser);
                    });
            }
        });
    },

    /**
     * Сменить пароль (функция для авторизованного пользователя)
     * @param req
     * @param res
     * @returns {*}
     */
    changePasswordProfile: function (req, res) {

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

                User.update({id: req.session.me}, {encryptedPassword: encryptedPassword})
                    .exec(function (err, updatedUser) {
                        if (err) {
                            return res.negotiate(err);
                        }
                        return res.json(updatedUser);
                    });
            }
        });
    },

    /**
     * Установка пользователю прав администратора
     * @param req
     * @param res
     */
    updateAdmin: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});


        User.update(req.param('id'), {
            admin: req.param('admin'),
            switchAdmin: req.param('admin')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },


    /**
     * Установка пользователю прав кадровика
     * @param req
     * @param res
     */
    updateKadr: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
            kadr: req.param('kadr'),
            switchKadr: req.param('kadr')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    /**
     * Установка пользователю прав руководителя
     * @param req
     * @param res
     */
    //updateLeader: function (req, res) {
    //    if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //    User.update(req.param('id'), {
    //        leader: req.param('leader')
    //    }).exec(function (err, update) {
    //        if (err) return res.negotiate(err);
    //        return res.ok();
    //    });
    //},


    /**
     * Переключение в режим сотрудника и обратно
     * @param req
     * @param res
     */
    switchPolice: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        User.findOne({id: req.session.me}).exec((err, findOne)=> {
            if (err) return res.serverError(err);
            if (!findOne) return res.badRequest();
            if (findOne.switchAdmin) {
                let admin = (findOne.admin) ? false : true;
                sails.log.info('Переключение режима сотрудник (false)/admin (true): ' + new Date(), admin);
                User.update({id: req.session.me}, {
                    admin: admin
                }).exec(function (err, update) {
                    if (err) return res.badRequest();
                    return res.ok();
                });
            }

            if (findOne.switchKadr) {
                let kadr = (findOne.kadr) ? false : true;
                sails.log.info('Переключение режима сотрудник (false)/kadr (true): ' + new Date(), kadr);
                User.update({id: req.session.me}, {
                    kadr: kadr
                }).exec(function (err, update) {
                    if (err) return res.badRequest();
                    return res.ok();
                });
            }
        });
    },


    /**
     * Установка пользователю состояния активации (action)
     * @param req
     * @param res
     */
    updateAction: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
            action: req.param('action')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },


    //updateEmergence: function (req, res) {
    //    //console.log('REG ALLL:', req.params.all());
    //    if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //    User.update(req.param('id'), {
    //        emergence: req.param('emergence')
    //    }).exec(function (err, update) {
    //        if (err) return res.negotiate(err);
    //        return res.ok();
    //    });
    //},

    /**
     * Дать/Снять доступ к модулю Vacation (отпуска пользователя)
     * @param req
     * @param res
     */
    updateVacation: function (req, res) {
        //console.log('REG ALLL updateVacation:', req.params.all());
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
            vacation: req.param('vacation')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },

    /**
     * сразу всем Дать/Снять доступ к модулю Vacation  (отпуска пользователя)
     * @param req
     * @param res
     */
    updateVacationAll: function (req, res) {
        //console.log('REG ALLL updateVacationAll:', req.params.all());
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update({}, {
            vacation: req.param('change')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            console.log('update', update.length);
            return res.ok();
        });
    },

    /**
     * Дать/Снять доступ к модулю Emergence (выход нового пользователя)
     * @param req
     * @param res
     */
    updateEmergence: function (req, res) {
        console.log('REG ALLL666:', req.params.all());
        console.log('req.param id:', req.param('id'));
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        if (req.param('id') === 'undefined') return res.badRequest();

        User.update(req.param('id'), {
            emergence: [{
                action: req.param('action'),
                see: req.param('see'),
            }]
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },


    /**
     * сразу всем Дать/Снять доступ к модулю Emergence  (отпуска пользователя)
     * @param req
     * @param res
     */
    updateEmergenceAll: function (req, res) {
        //console.log('REG ALLL updateEmergenceAll:', req.params.all());
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.native(function (err, collection) {
            if (err) return res.serverError(err);
            collection.update({emergence: {$elemMatch: {action: {$ne: req.param('action')}}}}, {$set: {"emergence.$.action": req.param('action')}}, {multi: true},
                function (err, result) {
                    if (err) return res.serverError(err);
                    return res.ok();
                }
            );
        });
    },

    /**
     * Установка пользователю состояния удалён (deleted)
     * @param req
     * @param res
     */
    updateDeleted: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
            deleted: req.param('deleted')
        }).exec(function (err, update) {
            if (err) return res.negotiate(err);
            return res.ok();
        });
    },


    /**
     * Получить всех сотрудников по ID департамента
     */
    getUsersDepartment: function (req, res) {
        // if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        // db.user.find({subdivision:{id:'589b22e8789b83a241b55fd1'}})
        if (req.param('id')) {
            User.find({where: {subdivision: {id: req.param('id')}, fired: false}})
                .populate('positions')
                .exec(function foundUser(err, user) {
                    if (err) return res.serverError(err);
                    if (!user) return res.notFound();
                    res.ok(user);

                });
        }


        // else {
        //     if (!_.isUndefined(req.param('where')) && req.param('char').length > 0) {
        //         var q = {
        //             limit: req.params.limit,
        //             sort: req.params.sort
        //         };
        //         var y = {};
        //         y[req.param('property')] = {'like': req.param('char')};
        //         q.where = y;
        //         User.find(q)
        //             .exec(function foundUser(err, users) {
        //                 if (err) return res.serverError(err);
        //                 if (!users) return res.notFound();
        //                 return res.ok(users);
        //             });
        //     } else {
        //         User.find()
        //             .exec(function foundUser(err, users) {
        //                 if (err) return res.serverError(err);
        //                 if (!users) return res.notFound();
        //                 res.ok(users);
        //             });
        //     }
        // }
    },

    /**
     * Загрузка аватара на сервер
     * @param req
     * @param res
     */
    upload: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('formData: ', req.body);
        const dir = require('util').format('%s/images/user/avatar/%s', sails.config.appUrl.rootDir, req.body.id);
        let fileName = req.file('file')._files[0].stream.headers['content-disposition'].split('"').reverse()[1];
        //console.log('fileName', fileName);
        req.file('file').upload({
                dirname: dir,
                saveAs: fileName
            },
            function (err, files) {
                if (err) return res.serverError(err);
                if (_.isUndefined(files[0])) return res.notFound('Нет файла!');
                //if (files.length === 0) {
                //    return res.badRequest('Файл не загружен');
                //}
                //console.log("files: ", files);

                User.update(req.body.id, {
                        avatarUrl: require('util').format('/images/user/avatar/%s/%s', req.body.id, fileName),
                        avatarFd: files[0].fd,
                        fileNameAvatar: fileName
                    })
                    .exec(function (err) {
                        if (err) return res.negotiate(err);
                        //console.log(' avatarUrl: ', dir);
                        //console.log(' avatarUrl2: ', require('util').format('/images/user/avatar/%s/%s', req.body.id, fileName));
                        return res.ok();
                    });
            });
    },
    /**
     * Выбрать всех не уволеных пользователей
     * @param req
     * @param res
     */
    adminUsers: function (req, res) {
        User.find({
            where: {fired: false},
            limit: 300,
            sort: 'lastName'
        }).exec(function (err, users) {

            if (err) return res.negotiate(err);

            return res.json(users);

        });
    },

    /**
     * Обновить интерфейс отображаемый пользователю
     * @param req
     * @param res
     */
    updateInterface: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.native(function (err, collection) {
            if (err) return res.serverError(err);
            //console.log('WEEE', req.param('year'));
            collection.update({"_id": ObjectId(req.session.me)}, {$set: {interface: req.param('year')}},
                function (err, result) {
                    if (err) return res.serverError(err);
                    return res.ok();
                }
            )
        });
    },

    /**
     * Получить список пользователей в усечёном виде
     * @param req
     * @param res
     */
    getAllUsersName: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.native(function (err, collection) {
            if (err) return res.serverError(err);
            //console.log('WEEE', req.param('year'));
            collection.aggregate([{$match: {fired: false}}, {$sort: {lastName: 1}}, {
                    $project: {
                        lastName: 1,
                        firstName: 1,
                        patronymicName: 1,
                        avatarUrl: 1,
                        getShortName: 1
                    }
                }])
                .toArray(function (err, results) {
                    if (err) return res.serverError(err);
                    return res.ok(results);
                });
        });
    },


    /**
     * Обновить согласующего пользователю
     * @param req
     * @param res
     */
    updateMatching: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
                matchings: req.param('matching')
            })
            .populate('matchings')
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                return res.ok(update);
            });
    },


    /**
     * Добавить согласующего пользователю
     * @param req
     * @param res
     */
    addMatching: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('matchings')
            .exec(function (err, findOneUser) {
                if (err) return res.negotiate(err);
                findOneUser.matchings.add(req.param('value'));
                findOneUser.save(function (err) {
                    if (err) return res.negotiate(err);

                    return res.ok(findOneUser);
                });
            });
    },


    /**
     * Удалить согласующего у пользователя
     * @param req
     * @param res
     */
    deleteMatching: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.param('value')})
            .populate('matchings')
            .exec((err, user)=> {
                if (err) return req.serverError(err);
                if (!user) return res.badRequest(req.param('value'));
                if (req.param('del')) {
                    user.matchings.remove(req.param('id'));
                }
                user.save(function (err) {
                    if (err) return res.negotiate('ERR: ' + err);
                    res.ok(req.param('id'));
                });
            });

    },


    /**
     * Обновить оповещающего пользователю
     * @param req
     * @param res
     */
    updateAnnounced: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('req.param(announced):', req.param('announced'));
        User.update(req.param('id'), {
                announced: req.param('announced')
            })
            .populate('announced')
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                return res.ok(update);
            });
    },


    /**
     * Добавить оповещающего пользователю
     * @param req
     * @param res
     */
    addAnnounced: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('req.param(matching add):', req.param('matching'));
        sails.log.info('Добавлен оповещаемый: ', req.param('value'));
        User.findOne(req.param('id'))
            .populate('announced')
            .exec(function (err, findOneUser) {
                if (err) return res.negotiate(err);
                findOneUser.announced.add(req.param('value'));
                findOneUser.save(function (err) {
                    if (err) return res.negotiate(err);

                    return res.ok(findOneUser);
                });
            });
    },


    /**
     * Удалить оповещающего у пользователя
     * @param req
     * @param res
     */
    deleteAnnounced: function (req, res) {
        User.findOne({id: req.param('value')})
            .populate('announced')
            .exec((err, user)=> {
                if (err) return req.serverError(err);
                if (!user) return res.badRequest(req.param('value'));
                if (req.param('del')) {
                    user.announced.remove(req.param('id'));
                }
                user.save(function (err) {
                    if (err) return res.negotiate('ERR: ' + err);
                    res.ok(req.param('id'));
                });
            });

    },


    /**
     * Обновить пересечения пользователю
     * @param req
     * @param res
     */
    updateIntersections: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
                intersections: req.param('intersections')
            })
            .populate('intersections')
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                return res.ok(update);
            });
    },


    /**
     * Добавить пересечения пользователю
     * @param req
     * @param res
     */
    addIntersections: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('intersections')
            .exec(function (err, findOneUser) {
                if (err) return res.negotiate(err);
                findOneUser.intersections.add(req.param('value'));
                findOneUser.save(function (err) {
                    if (err) return res.negotiate(err);

                    return res.ok(findOneUser);
                });
            });
    },


    /**
     * Удалить пересечения у пользователя
     * @param req
     * @param res
     */
    deleteIntersections: function (req, res) {
        User.findOne({id: req.param('value')})
            .populate('intersections')
            .exec((err, user)=> {
                if (err) return req.serverError(err);
                if (!user) return res.badRequest(req.param('value'));
                if (req.param('del')) {
                    user.intersections.remove(req.param('id'));
                }
                user.save(function (err) {
                    if (err) return res.negotiate('ERR: ' + err);
                    res.ok(req.param('id'));
                });
            });
    },

    /**
     * Обновить 'я согласующий' пользователю
     * @param req
     * @param res
     */
    updateIAgree: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.update(req.param('id'), {
                iagree: req.param('iagree')
            })
            .populate('iagree')
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                return res.ok(update);
            });
    },

    /**
     * Обновить 'кол-во строк в таблице' пользователю
     * @param req
     * @param res
     */
    updateDefaultRows: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('req in', req.param('defaultRows'));
        User.update(req.session.me, {
                defaultRows: req.param('defaultRows')
            })
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                //console.log('req out', update);
                return res.ok(update);
            });
    },


    /**
     * Добавить 'я согласующий' пользователю
     * @param req
     * @param res
     */
    addIAgree: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id'))
            .populate('iagree')
            .exec(function (err, findOneUser) {
                if (err) return res.negotiate(err);
                findOneUser.iagree.add(req.param('value'));
                findOneUser.save(function (err) {
                    if (err) return res.negotiate(err);
                    return res.ok(findOneUser);
                });
            });
    },


    /**
     * Удалить 'я согласующий' у пользователя
     * @param req
     * @param res
     */
    deleteIAgree: function (req, res) {
        User.findOne({id: req.param('value')})
            .populate('iagree')
            .exec((err, user)=> {
                if (err) return req.serverError(err);
                if (!user) return res.badRequest(req.param('value'));
                if (req.param('del')) {
                    user.iagree.remove(req.param('id'));
                }
                user.save(function (err) {
                    if (err) return res.negotiate('ERR: ' + err);
                    res.ok(req.param('id'));
                });
            });
    }
};

//