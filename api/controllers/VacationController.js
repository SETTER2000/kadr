/**
 * VacationController
 * Отпуска
 * @description :: Server-side logic for managing vacations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
moment.locale('ru');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');


module.exports = {
    /**
     * Получить объект
     * @param req
     * @param res
     */
    get: function (req, res) {
        "use strict";
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});


        var q = {
            limit: req.param('limit'),
            sort: req.param('sort')
        };
        if (!_.isUndefined(req.param('where')) && !_.isUndefined(req.param('char'))) {
            var y = {};
            y[req.param('property')] = {'like': req.param('char')};
            q.where = y;
        }
        //if (!_.isUndefined(req.param('where'))){
        //    q.where = JSON.parse(req.param('where'));
        //}
        //console.log('Q: ', q);
        //console.log('REQ_ALL:',req.allParams());

        //Vacation.find(q)
        //    .populate('furlough')
        //    .populate('owner')
        //    .populate('whomCreated')
        //    .populate('whomUpdated')
        //    .exec(function foundVacation(err, vacations) {
        //        if (err) return res.serverError(err);
        //        if (!vacations) return res.notFound();
        //
        //        _.forEach(vacations, function (vaca) {
        //            console.log('FROMUSHKA: ', vaca.from);
        //        });
        //        //console.log('VACA', vacations);
        //    return    res.send(vacations);
        //    });


        if (req.param('id')) {
            //console.log('VACTION ID:', req.param('id'));
            Vacation.findOne(req.param('id'))
                .populate('furlough')
                .populate('owner')
                .populate('whomCreated')
                .populate('whomUpdated')
                .exec(function foundVacation(err, vacations) {
                    if (err) return res.serverError(err);
                    if (!vacations) return res.notFound();
                    console.log('vacations RESPONS one :', vacations);

                    return res.ok(vacations);
                });
        }
        else {
            //console.log('SORT USER:', q);
            User.findOne({id: req.session.me})
                .populate('vacations')
                .populate('positions')
                .populate('interfaces')
                .exec(function foundVacation(err, findOneUser) {
                    if (err) return res.serverError(err);
                    if (!findOneUser) return res.notFound();
                    if (!findOneUser.interfaces.length) {
                        console.log('ОШИБКА! Нет свойства "год" в коллекции Interface, у пользователя ' +
                            findOneUser.lastName + ' ' + findOneUser.firstName +
                            '. Перейдите по ссылке http://' + req.headers.host + '/interface/create');

                        return res.badRequest('ВНИМАНИЕ! Отсутствует свойство "год" в коллекции' +
                            '. Перейдите по ссылке http://' + req.headers.host + '/interface/create');
                    }
                    let from = {$gte: new Date(moment(findOneUser.interfaces[0].year, ["YYYY"]).startOf("year"))};
                    User.find(q)
                        .populate('vacations')
                        .populate('positions')
                        .populate('interfaces')
                        .exec(function foundUser(err, users) {
                            if (err) return res.serverError(err);
                            if (!users) return res.notFound();
                            let us = [];
                            _.forEach(users, function (user) {
                                let ob = {};
                                ob.from = from;
                                ob.owner = user.id;
                                //console.log('user.id === req.session.me', user.id +'=== '+req.session.me);
                                //if (user.id === req.session.me) {
                                //    console.log('FIO:::', ob.from= new Date(moment(user.interfaces[0].year, ["YYYY"]).startOf("year")));
                                //}
                                //console.log('UIP: ', user);
                                //console.log('LENGTH: ', user.vacations.length);
                                //if (user.vacations.length > 0) us.push({'owner': user.id});
                                us.push(ob);
                            });

                            //console.log('ОТОБРАННЫЕ:', us);
                            //console.log('USER ODIN:', users[0]);
                            //console.log('DDDDDDDDDDDDDDASreq.session :', req.session.me);
                            Vacation.find(us)
                                .populate('furlough')
                                .populate('owner')
                                .populate('whomCreated')
                                .populate('whomUpdated')
                                .exec(function foundVacation(err, vacations) {
                                    if (err) return res.serverError(err);
                                    if (!vacations) return res.notFound();

                                    //_.forEach(vacations, function (vaca) {
                                    //    console.log('FROMUSHKA: ', vaca.from);
                                    //});
                                    //console.log('VACA', vacations);
                                    res.ok(vacations);
                                });
                        });
                });
        }

    },


    /**
     * Создать
     * @param req
     * @param res
     * @returns {*}
     */
    create: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        if (!_.isNumber(req.param('daysSelectHoliday'))) return res.negotiate('Кол-во дней не число.');
        var obj = {
            section: 'Отпуск',
            sections: 'Отпуска',
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.session.me,
            whomUpdated: null,
            action: req.param('action'),
            status: 'pending'
            //action: (req.param('action')) ? req.param('action') : true
        };

        User.findOne({id: req.session.me})
            .populate('vacationWhomCreated')
            .populate('vacations')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                obj.owner = (req.param('owner')) ? req.param('owner').id : findUser.id;
                obj.whomCreated = findUser.id;
                Furlough.findOne(req.param('furlough'))
                    .populate('vacations')
                    .exec((err, findFurlough)=> {
                        "use strict";
                        if (err) return res.serverError(err);
                        if (!findFurlough) return res.notFound('Не найдено!');
                        console.log('---------------------------------------------**');
                        obj.furlough = findFurlough.id;
                        obj.from = new Date(moment(req.param('name').split(' ')[0], ['DD.MM.YYYY']));
                        obj.to = new Date(moment(req.param('name').split(' ')[2], ['DD.MM.YYYY']));
                        Vacation.native(function (err, collection) {
                            if (err) return res.serverError(err);

                            /**
                             * ПЕРЕСЕЧЕНИЕ ОТПУСКОВ
                             * Найти период где
                             * начало отпуска меньше или равно входящему началу отпуска и конец отпуска больше или равен входящему началу отпуска
                             * или
                             * начало отпуска меньше или равен входящему концу отпуска и конец отпуска больше или равен входящему концу отпуска
                             * или
                             * начало отпуска больше входящему началу отпуска и конец отпуска меньше входящему концу отпуска
                             */

                            collection.aggregate([
                                    {
                                        $match: {
                                            $or: [
                                                {$and: [{from: {$lte: obj.from}}, {to: {$gte: obj.from}}, {owner: ObjectId(obj.owner)}]},
                                                {$and: [{from: {$lte: obj.to}}, {to: {$gte: obj.to}}, {owner: ObjectId(obj.owner)}]},
                                                {$and: [{from: {$gt: obj.from}}, {to: {$lt: obj.to}}, {owner: ObjectId(obj.owner)}]}
                                            ]
                                        }
                                    }
                                ])
                                .toArray(function (err, results) {
                                    if (err) return res.serverError(err);

                                    //console.log('RESULT: ', results);
                                    if (results.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);

                                    Vacation.findOne({'name': req.param('name'), 'owner': obj.owner.id})
                                        .exec((err, findParam)=> {
                                            "use strict";
                                            if (err)return res.serverError(err);
                                            if (findParam) return res.badRequest(req.param('name') + ' - дубликат.');

                                            //console.log('findParam: ', findParam);
                                            console.log('=============================================*');

                                            Vacation.create(obj).exec(function (err, createVacation) {
                                                if (err) return res.serverError(err);
                                                console.log('Отпуск создал:', req.session.me);
                                                //console.log('Отпуск новый:', createVacation);
                                                findUser.vacations.add(createVacation.id);
                                                findUser.vacationWhomCreated.add(createVacation.id);
                                                //findUser.vacationWhomUpdated.add(finn.id);
                                                findFurlough.vacations.add(createVacation.id);

                                                //console.log('ОБЪЕКТ USER:', findUser);

                                                findUser.save(function (err) {
                                                    if (err) {
                                                        console.log('ОШИБКИ ЮЗЕРА:', err);
                                                        return res.negotiate(err);
                                                    }
                                                    //console.log('finn-7777777:', createVacation);
                                                    findFurlough.save(function (err) {
                                                        if (err) return res.negotiate(err);
                                                        //console.log('finn:', createVacation);
                                                        return res.send(createVacation);
                                                    });
                                                });
                                            });
                                        });
                                });
                        });

                    });
            });
    },


    /**
     * Обновить
     * @param req
     * @param res
     */
    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        var obj = {
            id: req.param('id'),
            section: req.param('section'),
            sections: req.param('sections'),
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.param('whomCreated'),
            whomUpdated: req.session.me,
            action: req.param('action'),
            from: req.param('from'),
            to: req.param('to')
        };
        User.findOne({id: req.session.me})
            .populate('vacationWhomUpdated')
            .populate('vacations')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                //console.log('findParam:', findUser);
                //obj.vacationWhomCreated = findUser.id;
                //obj.owner = findUser.id;
                obj.whomUpdated = findUser.id;
                Vacation.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
                    if (err)return res.negotiate(err);
                    console.log('objEdit: ', objEdit);
                    console.log('Отпуск обновил:', findUser.lastName + ' ' + findUser.firstName);
                    console.log('Отпуск обновление:', obj);
                    findUser.vacationWhomUpdated.add(objEdit[0].id);
                    findUser.save(function (err) {
                        if (err) return res.negotiate(err);
                        res.ok();
                    });
                });
            });
    },


    /**
     * Удалить
     * @param req
     * @param res
     * @param next
     */
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Vacation.findOne(req.param('id')).exec((err, finds)=> {
            "use strict";
            if (err) return res.serverError(err);
            if (!finds) return res.notFound();

            Vacation.destroy(req.param('id'), (err) => {
                if (err)return next(err);
                console.log('Отпуск удалил:', req.session.me);
                console.log('Отпуск удалён:', finds);
                res.ok();
            });
        });

        // res.redirect('/admin/users');


    },


    /**
     * Кол-во дней взятых на отпуск по годам
     */
    daysInYear: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        let year = (req.param('year')) ? req.param('year') : moment().year();
        console.log('YEAR:', year);
        User.findOne({id: req.session.me})
            .populate('vacationWhomCreated')
            .populate('vacations')
            .populate('interfaces')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();

                if (!findUser.interfaces.length) {
                    return console.log('ОШИБКА! Нет свойства "год" в коллекции Interface, у пользователя ' +
                        findUser.lastName + ' ' + findUser.firstName +
                        '. Перейдите по ссылке http://' + req.headers.host + '/interface/create');
                }
                year = findUser.interfaces[0].year;
                //console.log('YEAR Vacation :', year);
                Vacation.native(function (err, collection) {
                    if (err) return res.serverError(err);
                    collection.aggregate([
                        {$match: {owner: ObjectId(findUser.id), action: true}},
                        {$group: {_id: {year: {$year: "$from"}, owner: "$owner"}, count: {$sum: "$daysSelectHoliday"}}},
                        {$project: {'_id.year': 1, count: 1}},
                        {$sort: {'_id.year': 1}}
                    ]).toArray(function (err, results) {
                        if (err) return res.serverError(err);
                        //console.log('Выбраные года:', results);
                        if (!results.length)   return res.ok({count: 0});
                        let obYear = {count: 0};
                        _.forEach(results, function (value, key) {
                            //console.log('VALUE', value);
                            if (value['_id'].year == year) obYear = value;
                        });
                        //console.log('RESPONSE YEARS ARR: ', obYear);
                        return res.ok(obYear);
                    });
                });
            });
    },

    /**
     * писок годов доступных для вывода в селектор годо
     */
    getYears: function (req, res) {

        Vacation.native(function (err, collection) {
            if (err) return res.serverError(err);
            collection.aggregate(
                [
                    {
                        $group: {
                            _id: {year: {$year: "$from"}}
                        }
                    },
                    {$sort: {'_id.year': -1}},
                    {
                        $project: {
                            id: "$_id.year",
                            year: "$_id.year",
                            "_id": 0
                        }
                    }
                ]
            ).toArray(function (err, results) {
                if (err) return res.serverError(err);
                console.log(results);
                return res.send(results);
            });
        });
    },


    /**
     * Отпуска из списка пересечений
     */
    getIntersections: function (req, res) {
        //console.log('INTERSECTIO:', req.param('id'));
        let userID = (req.param('id')) ? req.param('id') : req.session.me;
        //(req.param('id')) ? res.ok(req.param('id')) : res.ok(req.session.me);
        console.log('IDDD:', userID);
        User.findOne({id: userID})
            .populate('intersections')
            .populate('vacations')
            .exec((err, user)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!user) return res.badRequest();
                if (!user.intersections.length) return res.ok();
                console.log('GETTT', user.getShortName());
                //return res.ok(user.intersections);
                let ar = [];
                _.forEach(user.intersections, function (val, key) {
                    ar.push(val.id);
                });
                console.log('user.intersections', user.intersections);
                console.log('ar', ar);
                Vacation.find({where: {owner: ar}},{sort:'from'})
                    .populate('furlough')
                    .populate('owner',{sort:'lastName'})
                    .exec((err, vacationsFind)=> {
                        if (err) return res.serverError(err);

                        console.log('RESPONSE: ', vacationsFind);

                        res.ok(vacationsFind);
                    });
            });

    }
};

