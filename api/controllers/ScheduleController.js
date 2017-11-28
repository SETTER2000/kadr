/**
 * VacationController
 *
 * @description :: TODO: график отпусков
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ObjectId = require('mongodb').ObjectId;
const zone = "Europe/Moscow";
var Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
moment.locale('ru');

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const http = require('http');


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

        //Schedule.find(q)
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
            Schedule.findOne(req.param('id'))
                .populate('furlough')
                .populate('owner')
                .populate('whomCreated')
                .populate('whomUpdated')
                .populate('intersec')
                .populate('chats')
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
                            Schedule.find(us)
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

        console.log('OWNER', req.param('owner'));
        console.log('furlough', req.param('furlough'));

        let obj = {
            section: 'Отпуск',
            sections: 'Отпуска',
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.session.me,
            whomUpdated: null,
            action: req.param('action'),
            maxTwoWeek: req.param('maxTwoWeek'),
            status: 'pending',
            furlough: req.param('furlough'),
            owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
            from: new Date(req.param('from')),
            to: new Date(req.param('to'))
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

                    /**
                     * Формируем массив идентификаторов пользователей,
                     * которые указаны в поле отслеживания за пересечениями.
                     * По сути это id тех, с кем отслеживаю пересечения моего отпуска.
                     */
                    let a = [];
                    _.forEach(findUser.intersections, function (val, key) {
                        a.push(val.id);
                    });
                    /**
                     * Проверяем тип отпуска создаваемый пользователем на предмет
                     * разрешённости пересечения с собственными уже созданными отпусками
                     * Проще сказать, если отпуску разрешено пересекаться с уже созданными отпусками, то
                     * сообщение о пересечении не выводится пользователю и отпуск добавляется в БД, ну и наоборот.
                     */
                        // Выбираем все типы отпусков которым не разрешено совпадение
                    Furlough.find({fixIntersec: false}).exec((err, findFurlough)=> {
                        if (err) return res.serverError(err);
                        console.log('obj.furlough.id', obj.furlough.id);
                        console.log('findFurlough', findFurlough);
                        //if (findFurlough.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);
                        let b = [];
                        _.forEach(findFurlough, function (val, key) {
                            b.push(val.id);
                        });

                        console.log('ID типов отпусков, не разр. пересечение:', b);
                        /**
                         * Проверяем пересекается ли отпуск с уже существующим для данного пользователя.
                         * По сути проверяем чтоб не было пересечения со своим же отпуском
                         */
                        Schedule.native(function (err, collection) {
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
                                    console.log('results', results);
                                    //if (results.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);
                                    /**
                                     * Заполнить поле vacations объектами отпусков с которыми
                                     * пересекается вновь создаваемый отпуск.
                                     * Тем самым находим отпуска пересекающиеся с нашим, у тех людей
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
                                                    },
                                                    {
                                                        from: {
                                                            '<': new Date(moment(req.param('from')))
                                                        },
                                                        to: {
                                                            '>': new Date(moment(req.param('to')))
                                                        }
                                                    }
                                                ]
                                            }
                                        })
                                        .exec((err, users) => {
                                            if (err) return res.serverError(err);
                                            Schedule.create(obj).exec(function (err, createVacation) {
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
                                                // console.log('findUser++:', findUser);
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
                }
            )
        ;
    },


    /**
     * Обновить
     * @param req
     * @param res
     */
    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});


        console.log('UPDATE req.owner', req.param('owner'));
        console.log('UPDATE req.session', req.session);


        let obj = {
            id: req.param('id'),
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomUpdated: req.session.me,
            action: req.param('action'),
            maxTwoWeek: req.param('maxTwoWeek'),
            owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
            from: new Date(req.param('from')),
            to: new Date(req.param('to')),
            intersec: []
        };

        User.findOne({id: obj.owner})
            .populate('vacationWhomUpdated')
            .populate('vacations')
            .populate('intersections')
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();

                /**
                 * Формируем массив идентификаторов пользователей,
                 * которые указаны в поле отслеживания за пересечениями.
                 * По сути это id тех, с кем отслеживаю пересечения моего отпуска.
                 */
                let a = [];
                _.forEach(findUser.intersections, function (val, key) {
                    a.push(val.id);
                });


                //console.log('INTERSECTIONS A:', a);
                /**
                 * Проверяем пересекается ли отпуск с уже существующим для данного пользователя.
                 * По сути проверяем чтоб не было пересечения со своим же отпуском
                 */
                Schedule.native(function (err, collection) {
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
                                        {$and: [{from: {$lte: obj.from}}, {to: {$gte: obj.from}}, {owner: ObjectId(obj.owner)}, {_id: {$ne: ObjectId(req.param('id'))}}]},
                                        {$and: [{from: {$lte: obj.to}}, {to: {$gte: obj.to}}, {owner: ObjectId(obj.owner)}, {_id: {$ne: ObjectId(req.param('id'))}}]},
                                        {$and: [{from: {$gt: obj.from}}, {to: {$lt: obj.to}}, {owner: ObjectId(obj.owner)}, {_id: {$ne: ObjectId(req.param('id'))}}]}
                                    ]
                                }
                            }
                        ])
                        .toArray(function (err, results) {
                            if (err) return res.serverError(err);
                            if (results.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);
                            /**
                             * Заполнить поле vacations объектами отпусков с которыми
                             * пересекается вновь создаваемый отпуск.
                             * Тем самым находим отпуска пересекающиеся с нашим, у тех людей
                             * за которыми отслеживаем пересечения.
                             */
                            User.find({id: a})
                                .populate('owner', {where: {'id': {'!': obj.owner}}})
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
                                            },
                                            {
                                                from: {
                                                    '<': new Date(moment(req.param('from')))
                                                },
                                                to: {
                                                    '>': new Date(moment(req.param('to')))
                                                }

                                            }
                                        ]
                                    }
                                })
                                .exec((err, users) => {
                                    if (err) return res.serverError(err);
                                    _.forEach(users, function (v, k) {
                                        // console.log('Отпуска пересекаемые с нашим:', v.vacations);
                                        if (_.isArray(v.vacations) && (v.vacations.length > 0)) {
                                            _.forEach(v.vacations, function (val, key) {
                                                obj.intersec.push(val.id);
                                            });
                                        }
                                    });

                                    //console.log('obj.intersec', obj.intersec);

                                    Schedule.find()
                                        .populate('intersec', {where: {id: req.param('id')}})
                                        .exec((err, findVacation)=> {
                                            if (err) return res.negotiate(err);
                                            //console.log('FIND VACAT', findVacation);
                                            _.forEach(findVacation, function (v, k) {
                                                if (v.intersec.length) {
                                                    findVacation[k].intersec.remove(req.param('id'));
                                                    //console.log('XX', findVacation[k].intersec);
                                                    findVacation[k].save(function (err) {
                                                        if (err) return res.negotiate(err);
                                                        //console.log('XX2', findVacation[k].intersec);
                                                    });
                                                }
                                            });
                                        });
                                    Schedule.update(req.param('id'), obj)
                                        .exec(function updateObj(err, objEdit) {
                                            if (err) return res.negotiate(err);
                                            sails.log('Обновлён отпуск у (' + objEdit[0].id + '):', findUser.lastName + ' ' + findUser.firstName);
                                            sails.log('Обновил отпуск (' + objEdit[0].id + '):', obj.whomUpdated);
                                            findUser.save(function (err) {
                                                if (err) return res.negotiate(err);
                                                res.ok();
                                            });
                                        });
                                });
                        });
                });
            });
    }
    ,


    /**
     * Удалить
     * @param req
     * @param res
     * @param next
     */
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Schedule.findOne(req.param('id')).exec((err, finds) => {
            "use strict";
            if (err) return res.serverError(err);
            if (!finds) return res.notFound();

            Schedule.destroy(req.param('id'), (err) => {
                if (err) return next(err);
                console.log('Отпуск удалил:', req.session.me);
                console.log('Отпуск удалён:', finds);
                res.ok();
            });
        });

        // res.redirect('/admin/users');


    }
    ,

    /**
     * Кол-во дней оставшихся на отпуск в следующем году
     */
    getDaysPeriodYear: function (req, res) {
        Interface.create(req, res);
        User.findOne({id: req.session.me})
            .populate('interfaces')
            .populate('vacations')
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                //console.log('findUser:', findUser);
                let intfaceYear = (findUser['interfaces'].length) ? findUser['interfaces'][0].year : moment().get('year');
                let year = (req.param('year')) ? req.param('year') : intfaceYear;

                Schedule.find({
                    where: {
                        owner: req.session.me,
                        or: [
                            {
                                from: {
                                    '>=': new Date(moment(year, ["YYYY"]).startOf('year')), // set to January 1st, 12:00 am this year
                                    '<=': new Date(moment(year, ["YYYY"]).endOf("year")) // set the moment to 12-31 23:59:59.999 this year
                                }
                            },
                            {
                                to: {
                                    '>=': new Date(moment(year, ["YYYY"]).startOf('year')), // set to January 1st, 12:00 am this year
                                    '<=': new Date(moment(year, ["YYYY"]).endOf("year")) // set the moment to 12-31 23:59:59.999 this year
                                }
                            }
                        ]
                    }
                }).exec((err, findVacations) => {
                    if (err) return res.serverError(err);
                    if (!findVacations) return res.notFound();
                    _.forEach(findVacations, function (v, k) {
                        console.log('VALUE: ', v.name);
                    });
                    console.log('***************************//******************************** ');
                    //console.log('findVacations', findVacations);
                    let obj = {};

                    // Праздники в RF
                    let holidaysRf = sails.config.holidaysRf.data;
                    //let holidaysRf = ["01.01.2017", "02.01.2017", "03.01.2017", "04.01.2017", "05.01.2017", "06.01.2017", "07.01.2017", "08.01.2017", "23.02.2017", "08.03.2017", "01.05.2017", "09.05.2017", "12.06.2017", "04.11.2017", "01.01.2018", "02.01.2018", "03.01.2018", "04.01.2018", "05.01.2018", "06.01.2018", "07.01.2018", "08.01.2018", "23.02.2018", "08.03.2018", "01.05.2018", "09.05.2018", "12.06.2018", "04.11.2018", "01.01.2019", "02.01.2019", "03.01.2019", "04.01.2019", "05.01.2019", "06.01.2019", "07.01.2019", "08.01.2019", "23.02.2019", "08.03.2019", "01.05.2019", "09.05.2019", "12.06.2019", "04.11.2019"];

                    //console.log('holidays',holidays);
                    let vacationPeriodsFrom = findVacations.map(function (vacation) {
                        return moment.tz(vacation.from, zone);
                    });
                    let vacationPeriodsTo = findVacations.map(function (vacation) {
                        return moment.tz(vacation.to, zone);
                    });
                    let vacationSelectDays = findVacations.map(function (vacation) {
                        return vacation.daysSelectHoliday;
                    });

                    obj.maxFrom = moment.tz(moment.max(vacationPeriodsFrom), zone);  // максималная дата начала отпуска
                    obj.maxTo = moment.tz(moment.max(vacationPeriodsTo), zone);  // максималная дата конца отпуска
                    obj.yearFrom = moment(obj.maxFrom).get('year'); // год начала максимального периода
                    obj.yearTo = moment(obj.maxTo).get('year'); // год окончания макс. периода
                    obj.dh = vacationSelectDays;

                    obj.minFrom = moment.tz(moment.min(vacationPeriodsFrom), zone);  // минимальная дата начала отпуска
                    obj.minTo = moment.tz(moment.min(vacationPeriodsTo), zone);  // минимальная дата конца отпуска
                    obj.yearMinFrom = (findVacations.length > 1) ? moment(obj.minFrom).get('year') : 1000; // год начала минимального периода
                    obj.yearMinTo = (findVacations.length > 1) ? moment(obj.minTo).get('year') : 1000; // год окончания минимального. периода


                    /**
                     * Всего дней выбраных во всех периодах начиная
                     * с года интерфейса пользователя.
                     * Для каждого элемента массива запустить функцию,
                     * промежуточный результат передавать первым аргументом далее
                     */
                    obj.allDays = obj.dh.reduce(function (sum, current) {
                        return sum + current;
                    }, 0);

                    obj.startVacationDateFormat = moment.tz(obj.maxFrom.clone(), zone).format('LLLL');
                    obj.endVacationDateFormat = moment.tz(obj.maxTo.clone(), zone).format('LLLL');
                    obj.startVacationDateFormatMinFrom = moment.tz(obj.minFrom.clone(), zone).format('LLLL');
                    obj.endVacationDateFormatMinTo = moment.tz(obj.minTo.clone(), zone).format('LLLL');


                    /**
                     * Последняя точка времени года
                     */
                    obj.endOfYear = obj.maxFrom.clone().endOf('year');

                    /**
                     * Последняя точка времени года (минимальный диапазон)
                     */
                    obj.endOfYearMinTo = obj.minTo.clone().startOf('year');


                    let holidays = []; // праздничные дни попавшие в отпуск
                    let holidaysMin = []; // праздничные дни попавшие в отпуск (минимальный диапазон)
                    let workdays = []; // рабочии дни попавшие в отпуск, по сути то что и считается отпуском
                    let workdaysMin = []; // рабочии дни попавшие в отпуск, по сути то что и считается отпуском (минимальный диапазон)
                    let allDaysVacation = []; // все выбранные дни отпуска
                    let allDaysVacationMin = []; // все выбранные дни отпуска (минимальный диапазон)
                    let tail = []; // (хвост) рабочии дни попавшие в следующий год
                    let tailMin = []; // (хвост) рабочии дни попавшие в предыдущий год
                    let tailMinInterface = []; // хвост рабочих дней попавших в год выбранного интерфейса из минимального периода
                    let tailInterface = []; // хвост рабочих дней попавших в год выбранного интерфейса из максимального периода


                    /**
                     * Создаём из начальной и конечной даты отпуска диапазон
                     */
                    const range = moment.range(obj.maxFrom, obj.maxTo);

                    /**
                     * Создаём из начальной и конечной даты отпуска диапазон (минимальный)
                     */
                    const rangeMin = moment.range(obj.minFrom, obj.minTo);

                    /**
                     * Обходим диапазон по дням (для этого в скобках константа day, можно по месяцам обойти month)
                     * Заполняем массив всех дней попавших в период отпуска
                     */
                    for (let day of range.by('day')) {
                        allDaysVacation.push(day.format('YYYY-MM-DD'));
                    }

                    /**
                     * Обходим диапазон по дням (для этого в скобках константа day, можно по месяцам обойти month)
                     * Заполняем массив всех дней попавших в период отпуска
                     */
                    for (let day of rangeMin.by('day')) {
                        allDaysVacationMin.push(day.format('YYYY-MM-DD'));
                    }


                    /**
                     * Заполняем массив праздничных дней попавших в период отпуска
                     */
                    _.forEach(holidaysRf, function (val, key) {
                        const m = moment(val, ['DD.MM.YYYY']);
                        if (range.contains(m)) holidays.push(m.format('YYYY-MM-DD'));
                        //(moment(day.format('YYYY-MM-DD')).isSame(moment(val, ['DD.MM.YYYY']).tz(zone))) ? holidays.push(day.format('YYYY-MM-DD')) : workdays[day.format('YYYYMMDD')]=day.format('YYYY-MM-DD');
                    });

                    /**
                     * Заполняем массив праздничных дней попавших в период отпуска
                     */
                    _.forEach(holidaysRf, function (val, key) {
                        const m = moment(val, ['DD.MM.YYYY']);
                        if (rangeMin.contains(m)) holidaysMin.push(m.format('YYYY-MM-DD'));
                        //(moment(day.format('YYYY-MM-DD')).isSame(moment(val, ['DD.MM.YYYY']).tz(zone))) ? holidays.push(day.format('YYYY-MM-DD')) : workdays[day.format('YYYYMMDD')]=day.format('YYYY-MM-DD');
                    });


                    /**
                     * Заполняем массив рабочими днями
                     * @type {Array}
                     */
                    workdays = _.difference(allDaysVacation, holidays);


                    /**
                     * Заполняем массив рабочими днями
                     * @type {Array}
                     */
                    workdaysMin = _.difference(allDaysVacationMin, holidaysMin);


                    /**
                     * Заполняем массив рабочими днями попавшими на другой год (хвост)
                     * @type {Array}
                     */
                    _.forEach(workdays, function (v, k) {
                        (moment(v).get('year') == ((obj.yearTo !== obj.yearFrom) ? obj.yearTo : 1000) ) ? tail.push(v) : '';
                        (moment(v).get('year') == ((obj.yearTo !== obj.yearFrom) ? obj.yearFrom : 1000) ) ? tailInterface.push(v) : '';
                    });


                    /**
                     * Заполняем массив рабочими днями попавшими на предыдущий год (хвост)(минимальный диапазон)
                     * @type {Array}
                     */
                    _.forEach(workdaysMin, function (v, k) {
                        (moment(v).get('year') == ((obj.yearMinTo !== obj.yearMinFrom) ? obj.yearMinFrom : 1000) ) ? tailMin.push(v) : '';
                        (moment(v).get('year') == ((obj.yearMinTo !== obj.yearMinFrom) ? obj.yearMinTo : 1000) ) ? tailMinInterface.push(v) : '';
                    });


                    /**
                     * Хвостик от отпуска в следующем году
                     * @type {number}
                     */
                    obj.diff = tail.length;

                    /**
                     * Хвостик от отпуска в следующем году
                     * @type {number}
                     */
                    obj.diffMin = tailMin.length;

                    /**
                     * Кол-во отпускных дней пренадлежащих только году интерфейса
                     * @type {number}
                     */
                    obj.selectDaysYearsPeriod = obj.allDays - obj.diff - obj.diffMin;

                    /**
                     * Кол-во отпускных дней пренадлежащих только году интерфейса
                     * @type {number}
                     */
                        //obj.selectDaysYearsPeriodMin = obj.allDays - obj.diffMin;

                    obj.holidaysMin = holidaysMin;
                    obj.holidays = holidays;
                    obj.workdays = workdays;
                    obj.workdaysMin = workdaysMin;
                    obj.allDaysVacation = allDaysVacation;
                    obj.allDaysVacationMin = allDaysVacationMin;
                    obj.tailMinInterface = tailMinInterface;
                    obj.tailInterface = tailInterface;

                    /**
                     * Дни отпуска попавшие в следующий год
                     * @type {Array}
                     */
                    obj.tail = tail;

                    /**
                     * Дни отпуска попавшие в следующий год
                     * @type {Array}
                     */
                    obj.tailMin = tailMin;


                    res.send(obj);
                });


            });
    }
    ,

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
                //console.log('YEAR Schedule :', year);
                Schedule.native(function (err, collection) {
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
    }
    ,


    /**
     * Список годов доступных для вывода в селектор года
     */
    getYears: function (req, res) {

        Schedule.native(function (err, collection) {
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
    }
    ,


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
                Schedule.find({where: {owner: ar}}, {sort: 'from'})
                    .populate('furlough')
                    .populate('owner', {sort: 'lastName'})
                    .exec((err, vacationsFind) => {
                        if (err) return res.serverError(err);

                        //console.log('RESPONSE: ', vacationsFind);

                        res.ok(vacationsFind);
                    });
            });

    }
    ,


    /**
     * Отпуска пересекающиеся c конкретным отпуском у пользователя,
     * который установлен в списке пересечений
     */
    getIntersectionsUser: function (req, res) {
        Schedule.native(function (err, collection) {
            if (err) return res.serverError(err);

            //db.vacation.aggregate([
            //    {$match:{ $or:[
            //        {$and: [{from:{$lte:ISODate("2017-10-02")}}, {to:{$gte:ISODate("2017-10-02")}}, {owner: ObjectId("58d285c3963240c8096f5416")}]},
            //        {$and: [{from:{$lte:ISODate("2017-12-22")}}, {to:{$gte:ISODate("2017-12-22")}}, {owner: ObjectId("58d285c3963240c8096f5416")}]},
            //        { $and: [ {from:{$gt:ISODate("2017-10-02")}}, {to:{$lt:ISODate("2017-12-22")}}, {owner: ObjectId("58d285c3963240c8096f5416")}] }
            //    ]}
            //    }
            //]).pretty();
            // console.log('FROM:', req.param('from'));
            // console.log('TO:', req.param('to'));
            // console.log('OWNER:', req.param('owner')); //
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
    ,


    /**
     * Получить праздники, выходные и т.д для календаря
     */
    dataCalendar: function (req, res) {
        res.ok(sails.config.holiday.data);

        //res.writeHead(200, {
        //    'Content-Type': 'text/event-stream; charset=UTF-8',
        //    'Cache-Control': 'no-cache',
        //    'Connection': 'keep-alive',
        //    'Access-Control-Allow-Credentials': true,
        //    'Access-Control-Allow-Origin': '*'
        //});

        //  host: 'http://data.gov.ru/api/json/dataset/7708660670-proizvcalendar/version/20151123T183036/content/10/?access_token=2eace3b1564af9461d112b0ec65e98ba',

    }
    ,

    /**
     * Чат отпуска
     * @param req
     * @param res
     * @returns {*}
     */
    joinChat: function (req, res) {

        // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
        if (!req.isSocket) {
            return res.badRequest();
        }
        // TODO: ^ Потяните это в политику `isSocketRequest`

        // Присоединитесь к комнате для этого отпуска (в качестве запрашивающего сокета)
        Schedule.subscribe(req, req.param('id'));

        // Присоединитесь к комнате отпуска для анимации ввода
        sails.sockets.join(req, 'vacation' + req.param('id'));
        // Schedule.watch(req);
        console.log('Connect chat ' + 'vacation' + req.param('id'));
        return res.ok();
    }
    ,


    chat: function (req, res) {
        console.log(' vacation', req.param('id'));
        console.log(' message', req.param('message'));
        console.log('sender me', req.session.me);
        console.log('REQ me', req.session);
        var values = req.allParams();
        console.log('REQ host', values);
        console.log('REQ host', req.host);
        console.log('REQ .subdomains', req.subdomains);
        console.log('REQ .body', req.body);
        // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
        if (!req.isSocket) {
            return res.badRequest();
        }
        // TODO: ^ pull this into a `isSocketRequest` policy


        User.findOne({
                id: req.session.me
            })
            .exec(function (err, foundUser) {
                if (err) return res.negotiate(err);
                if (!foundUser) return res.notFound();

                // Трансляция события WebSocket всем остальным, находящимся в настоящее время в сети,
                // поэтому их пользователь
                // агенты могут обновлять интерфейс для них.
                //console.log('foundUser', foundUser);
                //Schedule.publishUpdate(req.param('id'), {
                //    message: req.param('message'),
                //    username: foundUser.getFullName(),
                //    created: 'только сейчас',
                //    avatarURL: foundUser.avatarURL
                //});
                Chat.create({
                    message: req.param('message'),
                    sender: req.session.me,
                    vacation: req.param('id'),
                    avatarUrl: foundUser.avatarUrl,
                    username: foundUser.getShortName()
                }).exec(function (err, createdChat) {
                    if (err) return res.negotiate(err);


                    sails.sockets.broadcast('vacation' + req.param('id'), 'vacation', {
                        message: req.param('message'),
                        username: foundUser.getShortName(),
                        created: 'только сейчас',
                        avatarUrl: foundUser.avatarUrl
                    });


                    let strEmail = '';

                    if (_.isArray(foundUser.matchings) && (foundUser.matchings.length > 0)) {
                        let a = [];
                        _.forEach(foundUser.matchings, function (val, key) {
                            console.log('EMAIl:', val.email);
                            a.push(val.email);
                        });
                        strEmail = a.join(',');
                    }

                    let options = {
                        to: strEmail, // Кому: можно несколько получателей указать через запятую
                        subject: ' ! Чат отпуска ' + req.param('name') + '! Сообщение от ' + foundUser.getFullName(), // Тема письма
                        text: '<h2>Сообщение чата </h2>', // plain text body
                        html: '' +
                        '<h2>У Вас есть новое сообщение. </h2> ' +
                        '<p>' + req.param('message') + '</p>' +
                        '<p><a href="' + sails.config.appUrl.http + '/admin/vacations/edit/' + req.param('id') + '">перейти в чат</a></p>'

                    };
                    EmailService.sender(options);

                    return res.ok();

                });
            });
    }
    ,

    typing: function (req, res) {

        // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
        if (!req.isSocket) {
            return res.badRequest();
        }
        // TODO: ^ pull this into a `isSocketRequest` policy

        User.findOne({
            id: req.session.me
        }).exec(function (err, foundUser) {
            if (err) return res.negotiate(err);
            if (!foundUser) return res.notFound();

            // Событие сокетов Broadcast для всех остальных в настоящее время в сети, чтобы их пользовательские агенты
            // может обновить интерфейс для них.
            sails.sockets.broadcast('vacation' + req.param('id'), 'typing', {
                username: foundUser.getFullName()
            }, (req.isSocket ? req : undefined));

            return res.ok();
        });
    }
    ,

    stoppedTyping: function (req, res) {

        // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
        if (!req.isSocket) {
            return res.badRequest();
        }
        // TODO: ^ pull this into a `isSocketRequest` policy

        // Событие сокетов Broadcast для всех остальных в настоящее время в сети, чтобы их пользовательские агенты
        // может обновить интерфейс для них.
        sails.sockets.broadcast('vacation' + req.param('id'),
            'stoppedTyping', {}, (req.isSocket ? req : undefined));

        return res.ok();
    }
}
;

