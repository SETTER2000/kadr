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
                .populate('intersec')
                .exec(function foundVacation(err, vacations) {
                    if (err) return res.serverError(err);
                    if (!vacations) return res.notFound();
                    //console.log('vacations RESPONS one :', vacations);

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
                                .populate('intersec')
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
        let obj = {
            section: 'Отпуск',
            sections: 'Отпуска',
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.session.me,
            whomUpdated: null,
            action: req.param('action'),
            status: 'pending',
            furlough: req.param('furlough'),
            owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
            from: new Date(moment(req.param('from'))),
            to: new Date(moment(req.param('to')))
        };

        // console.log('req.body: ', req.body);
        // console.log('OWNER: ', req.param('owner'));
        // console.log('furlough: ', req.param('furlough'));
        // console.log('OWNER SESS ME: ', req.session.me);

        /**
         * Выбираем объект пользователя на которого будет записан отпуск
         */
        User.findOne({id: obj.owner})
            .populate('vacationWhomCreated')
            .populate('vacations')
            .populate('matchings')
            .populate('announced')
            .populate('intersections')
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();

                let a = [];
                /**
                 * Формируем массив идентификаторов пользователей,
                 * которые указаны в поле отслеживания за пересечениями.
                 * По сути это айдишники тех, с кем отслеживаю пересечения моего отпуска.
                 */
                _.forEach(findUser.intersections, function (val, key) {
                    a.push(val.id);
                });

                /**
                 * Проверяем пересекается ли отпуск с уже существующим для данного пользователя.
                 * По сути проверяем чтоб не было пересечения со своим же отпуском
                 */
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
                            if (results.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);

                            // console.log('findUser.intersections', findUser.intersections);


                            /**
                             * Заполнить поле vacations объектами отпусков с которыми
                             * пересекается вновь создаваемый отпуск.
                             * Тем сасмым находим отпуска пересекающиеся с нашим у тех людей,
                             * за которыми отслеживаем пересечения.
                             */
                            User.find({id: a})
                                .populate('vacations', {
                                    where: {
                                        or: [
                                            {
                                                from: {
                                                    '>=': new Date(moment(req.param('from'))),
                                                    '<=': new Date(moment(req.param('to')))
                                                }
                                            },
                                            {
                                                to: {
                                                    '>=': new Date(moment(req.param('from'))),
                                                    '<=': new Date(moment(req.param('to')))
                                                }
                                            }
                                        ]
                                    }
                                })
                                .exec((err, users) => {
                                    if (err) return res.serverError(err);
                                    Vacation.create(obj).exec(function (err, createVacation) {
                                        if (err) return res.serverError(err);
                                        console.log('Отпуск создал:', req.session.me);
                                        findUser.vacations.add(createVacation.id);
                                        findUser.vacationWhomCreated.add(createVacation.id);

                                        _.forEach(users, function (v, k) {
                                            // console.log('Отпуска пересекаемые с нашим:', v.vacations);
                                            if (_.isArray(v.vacations) && (v.vacations.length > 0)) {
                                                _.forEach(v.vacations, function (val, key) {
                                                    createVacation.intersec.add(val.id)
                                                });
                                            }
                                        });
                                        console.log('findUser++:', findUser);
                                        let strEmail = '';

                                        if (_.isArray(findUser.matchings) && (findUser.matchings.length > 0)) {
                                            let a = [];
                                            _.forEach(findUser.matchings, function (val, key) {
                                                console.log('EMAIl:', val.email);
                                                a.push(val.email);
                                            });
                                            strEmail = a.join(',');
                                        }


                                        findUser.save(function (err) {
                                            if (err) return res.negotiate(err);
                                            createVacation.save(function (err) {
                                                if (err) return res.negotiate(err);

                                                strEmail = (strEmail) ? strEmail : '';
                                                console.log('Согласующие:', strEmail);
                                                let options = {
                                                    to: strEmail, // Кому: можно несколько получателей указать через запятую
                                                    subject: ' ✔ ' + obj.section + ' создан! ' + findUser.getFullName(), // Тема письма
                                                    text: '<h2>Уведомление об отпуске </h2>', // plain text body
                                                    html: '' +
                                                    '<h2>Уведомление об отпуске </h2> ' +
                                                    '<p>' + obj.section + ' для ' + findUser.getFullName() + ' создан</p>' +
                                                    '<p> C ' + moment(obj.from).format('LLLL') + ' по ' + moment(obj.to).format('LLLL') + '</p>' +
                                                    '<p> Кол-во дней: ' + obj.daysSelectHoliday + '</p>'
                                                };
                                                EmailService.sender(options);
                                                return res.send(createVacation);
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
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                //console.log('findParam:', findUser);
                //obj.vacationWhomCreated = findUser.id;
                //obj.owner = findUser.id;
                obj.whomUpdated = findUser.id;
                Vacation.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
                    if (err) return res.negotiate(err);
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
        Vacation.findOne(req.param('id')).exec((err, finds) => {
            "use strict";
            if (err) return res.serverError(err);
            if (!finds) return res.notFound();

            Vacation.destroy(req.param('id'), (err) => {
                if (err) return next(err);
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
        //console.log('YEAR:', year);
        User.findOne({id: req.session.me})
            .populate('vacationWhomCreated')
            .populate('vacations')
            .populate('interfaces')
            .exec((err, findUser) => {
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
                        if (!results.length) return res.ok({count: 0});
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
                //console.log(results);
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
        //console.log('IDDD:', userID);
        User.findOne({id: userID})
            .populate('intersections')
            .populate('vacations')
            .exec((err, user) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!user) return res.badRequest();
                if (!user.intersections.length) return res.ok();
                //console.log('GETTT', user.getShortName());
                //return res.ok(user.intersections);
                let ar = [];
                _.forEach(user.intersections, function (val, key) {
                    ar.push(val.id);
                });
                //console.log('user.intersections', user.intersections);
                //console.log('ar', ar);
                Vacation.find({where: {owner: ar}}, {sort: 'from'})
                    .populate('furlough')
                    .populate('owner', {sort: 'lastName'})
                    .exec((err, vacationsFind) => {
                        if (err) return res.serverError(err);

                        //console.log('RESPONSE: ', vacationsFind);

                        res.ok(vacationsFind);
                    });
            });

    },


    /**
     * Отпуска пересекающиеся c конкретным отпуском у пользователя,
     * который установлен в списке пересечений
     */
    getIntersectionsUser: function (req, res) {
        Vacation.native(function (err, collection) {
            if (err) return res.serverError(err);

            //db.vacation.aggregate([
            //    {$match:{ $or:[
            //        {$and: [{from:{$lte:ISODate("2017-10-02")}}, {to:{$gte:ISODate("2017-10-02")}}, {owner: ObjectId("58d285c3963240c8096f5416")}]},
            //        {$and: [{from:{$lte:ISODate("2017-12-22")}}, {to:{$gte:ISODate("2017-12-22")}}, {owner: ObjectId("58d285c3963240c8096f5416")}]},
            //        { $and: [ {from:{$gt:ISODate("2017-10-02")}}, {to:{$lt:ISODate("2017-12-22")}}, {owner: ObjectId("58d285c3963240c8096f5416")}] }
            //    ]}
            //    }
            //]).pretty();
            console.log('FROM:', req.param('from'));
            console.log('TO:', req.param('to'));
            console.log('OWNER:', req.param('owner')); //
            collection.aggregate(
                [
                    {
                        $match: {
                            $or: [
                                {$and: [{from: {$lte: new Date(moment(req.param('from')))}}, {to: {$gte: new Date(moment(req.param('from')))}}, {owner: ObjectId(req.param('owner'))}]},
                                {$and: [{from: {$lte: new Date(moment(req.param('to')))}}, {to: {$gte: new Date(moment(req.param('to')))}}, {owner: ObjectId(req.param('owner'))}]},
                                {$and: [{from: {$gt: new Date(moment(req.param('from')))}}, {to: {$lt: new Date(moment(req.param('to')))}}, {owner: ObjectId(req.param('owner'))}]}
                            ]
                        }
                    }
                ]
            ).toArray(function (err, results) {
                if (err) return res.serverError(err);
                //console.log(results);
                return res.send(results);
            });
        });


    }
};

