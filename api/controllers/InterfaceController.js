/**
 * InterfaceController
 *
 * @description :: Server-side logic for managing interfaces
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
const _ = require('lodash');


module.exports = {
    /**
     * Получить интерфейс конкретного пользователя
     */
    get: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me})
            .populate('interfaces')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                console.log('findUser.interfaces[0]', findUser.interfaces[0]);
                return res.ok(findUser.interfaces[0]);
            });
    },


    /**
     * Создать
     * @param req
     * @param res
     */
    create: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me})
            .populate('interfaces')
            .exec((err, findUser) => {
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                let year = (req.param('year')) ? req.param('year') : moment().year();
                console.log('findUser', findUser);
                if (findUser.interfaces.length) return res.badRequest('У вас уже есть готовый интерфейс!');
                let obj = {
                    year: year
                };

                Interface.create(obj).exec((err, createInterface)=> {
                    "use strict";
                    if (err) return res.serverError(err);
                    findUser.interfaces.add(createInterface.id);
                    findUser.save(function (err) {
                        if (err) {
                            console.log('ОШИБКИ ЮЗЕРА:', err);
                            return res.negotiate(err);
                        }
                        //return res.send(createInterface);
                        return res.backToHomePage();
                    });
                    //User.findOne(req.param('id')).exec(function (err, user) {
                    //    if (err) return next(err);
                    //
                    //    // Queue up a new pet to be added and a record to be created in the join table
                    //    user.positions.add({name: 'Программисты'});
                    //
                    //    // Save the user, creating the new pet and associations in the join table
                    //    user.save(function (err) {
                    //        if (err) return next(err);
                    //
                    //        res.send('OK!!!!!');
                    //    });
                    //
                    //})
                });

            });
    },

    /**
     * Обновить
     * @param req
     * @param res
     */
    update: function (req, res) {
        //console.log('BODY REQ: ', req.body);
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        if (!_.isNumber(req.param('year').year)) {
            return res.ok('Год остался без изменений.');
        }
        let obj = {
            year: req.param('year').year
        };

        User.findOne({id: req.session.me})
            .populate('interfaces')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if(!findUser) res.notFound();
                //console.log('FINOV: ', findUser.interfaces[0]);

                Interface.update(findUser.interfaces[0].id, obj)
                    .exec((err, updateInterface)=> {
                        "use strict";
                        if (err) return res.serverError(err);
                        console.log('UPDATE INTERFACE:', updateInterface);
                        return res.send(updateInterface);
                    });
            });

    }
};

