/**
 * VacationController
 *
 * @description :: TODO Отпуска
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ObjectId = require('mongodb').ObjectId;
// const moment = require('moment');
const zone = "Europe/Moscow";
var Moment = require('moment-timezone');
const MomentRange = require('moment-range'); // https://github.com/rotaready/moment-range#subtract
const moment = MomentRange.extendMoment(Moment);
moment.locale('ru');

const _ = require('lodash');
const path = require('path');
const momentBusiness = require('moment-business'); //(https://github.com/jmeas/moment-business)
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

        //console.log('GET ALL PARAMS Vacation:', req.params.all());
        let q = {
            limit: req.param('limit'),
            sort: req.param('sort')
        };
        if (!_.isUndefined(req.param('where')) && !_.isUndefined(req.param('char'))) {
            var y = {};
            y[req.param('property')] = {'like': req.param('char')};
            q.where = y;
        }

        if (req.param('id')) {
            Vacation.findOne(req.params.all())
                .populate('furlough')
                .populate('owner')
                .populate('whomCreated')
                .populate('whomUpdated')
                .populate('intersec')
                .populate('chats')
                .exec(function foundVacation(err, vacations) {
                    if (err) return res.serverError(err);
                    if (!vacations) return res.notFound();
                    return res.send(vacations);
                });
        }
        else {
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

                        return res.badRequest('ВНИМАНИЕ! Отсутствует свойство "год" в коллекции.  <a target="_blank" class="kadr-link" href="http://' + req.headers.host + '/interface/create">Перейдите по ссылке</a>');
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
                                us.push(ob);
                            });
                            Vacation.find(us)
                                .populate('furlough')
                                .populate('owner')
                                .populate('whomCreated')
                                .populate('whomUpdated')
                                .populate('intersec')
                                .exec(function foundVacation(err, vacations) {
                                    if (err) return res.serverError(err);
                                    if (!vacations) return res.notFound();
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
            maxTwoWeek: req.param('maxTwoWeek'),
            status: 'pending',
            furlough: req.param('furlough'),
            owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
            from: new Date(req.param('from')),
            to: new Date(req.param('to'))
        };

        Schedule.findOne({year: moment(req.param('from')).year()}).exec((err, findSchedule)=> {
            "use strict";
            if (err) return res.serverError(err);
            if (!findSchedule) return res.badRequest('Не создан график отпусков на этот год. Не смогу привязать отпуск.')
            console.log('findSchedule', findSchedule);
            obj.year = findSchedule.id;

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
                        Furlough.find({fixIntersec: false}).exec((err, findFurlough) => {
                            if (err) return res.serverError(err);
                            //if (findFurlough.length) return res.badRequest('Пересечение отпуска, с уже существующим c ' + results[0].name);
                            let b = [];
                            _.forEach(findFurlough, function (val, key) {
                                b.push(val.id);
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

                                        if (results.length) return res.badRequest('Пересекается с вашим отпуском запланированным с: ' + results[0].name);
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
                                                Vacation.create(obj).exec(function (err, createVacation) {
                                                    if (err) return res.serverError(err);
                                                    console.log('Отпуск создал:', req.session.me);
                                                    findUser.vacations.add(createVacation.id);
                                                    findUser.vacationWhomCreated.add(createVacation.id);
                                                    _.forEach(users, function (v, k) {
                                                        if (_.isArray(v.vacations) && (v.vacations.length > 0)) {
                                                            _.forEach(v.vacations, function (val, key) {
                                                                createVacation.intersec.add(val.id)
                                                            });
                                                        }
                                                    });
                                                    let strEmail = '';
                                                    if (_.isArray(findUser.matchings) && (findUser.matchings.length > 0)) {
                                                        let a = [];
                                                        _.forEach(findUser.matchings, function (val, key) {
                                                            //console.log('EMAIl:', val.email);
                                                            a.push(val.email);
                                                        });
                                                        strEmail = a.join(',');
                                                    }


                                                    findUser.save(function (err) {
                                                        if (err) return res.negotiate(err);
                                                        createVacation.save(function (err) {
                                                            if (err) return res.negotiate(err);

                                                            strEmail = (strEmail) ? strEmail : '';
                                                            //console.log('Согласующие:', strEmail);
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
                                                            if (obj.action) EmailService.sender(options);
                                                            sails.sockets.broadcast('vacation', 'badges-vacation', {
                                                                badges: [createVacation],
                                                                action: 'создан',
                                                                shortName: findUser.getShortName(),
                                                                fullName: findUser.getFullName(),
                                                                avatarUrl: findUser.avatarUrl
                                                            }, req);
                                                            return res.send(createVacation);
                                                        });
                                                    });
                                                });
                                            });
                                    });
                            });
                        });
                    }
                );
        });
    },


    /**
     * Обновить
     * @param req
     * @param res
     */
    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});


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
                                        if (_.isArray(v.vacations) && (v.vacations.length > 0)) {
                                            _.forEach(v.vacations, function (val, key) {
                                                obj.intersec.push(val.id);
                                            });
                                        }
                                    });


                                    Vacation.find()
                                        .populate('intersec', {where: {id: req.param('id')}})
                                        .exec((err, findVacation) => {
                                            if (err) return res.negotiate(err);

                                            _.forEach(findVacation, function (v, k) {
                                                if (v.intersec.length) {
                                                    findVacation[k].intersec.remove(req.param('id'));
                                                    findVacation[k].save(function (err) {
                                                        if (err) return res.negotiate(err);
                                                    });
                                                }
                                            });
                                        });
                                    Vacation.update(req.param('id'), obj)
                                        .exec(function updateObj(err, objEdit) {
                                            if (err) return res.negotiate(err);
                                            sails.log('Обновлён отпуск у (' + objEdit[0].id + '):', findUser.lastName + ' ' + findUser.firstName);
                                            sails.log('Обновил отпуск (' + objEdit[0].id + '):', obj.whomUpdated);
                                            findUser.save(function (err) {
                                                if (err) return res.negotiate(err);
                                                sails.sockets.broadcast('vacation', 'badges-vacation', {
                                                    badges: objEdit,
                                                    action: 'обновлён',
                                                    shortName: findUser.getShortName(),
                                                    fullName: findUser.getFullName(),
                                                    avatarUrl: findUser.avatarUrl
                                                }, req);
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
        User.findOne({id: req.session.me}).exec((err, findUser) => {
            "use strict";
            if (err) return res.serverError(err);
            if (!findUser) return res.serverError(err);

            Vacation.findOne(req.param('id')).exec((err, finds) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!finds) return res.notFound();

                Vacation.destroy(req.param('id'), (err) => {
                    if (err) return next(err);
                    console.log('Отпуск удалил:', req.session.me);
                    console.log('Отпуск удалён:', finds);
                    sails.sockets.broadcast('vacation', 'badges-vacation', {
                        badges: [finds],
                        action: 'удалён',
                        shortName: findUser.getShortName(),
                        fullName: findUser.getFullName(),
                        avatarUrl: findUser.avatarUrl
                    }, req);
                    return res.ok();
                });
            });
        });
        // res.redirect('/admin/users');


    }
    ,

    /**
     * Удалить все зависимости графика отпусков согласно году запроса
     * @param req
     * @param res
     * @param next
     */
    deleteAllVacationToYear: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me}).exec((err, findUser) => {
            "use strict";
            if (err) return res.serverError(err);
            if (!findUser) return res.serverError(err);
            Vacation.find()
                .populate('year', {where: {year: req.param('year')}})
                .exec((err, finds) => {
                    "use strict";
                    if (err) return res.serverError(err);
                    if (!finds) return res.notFound();
                    let y = [];
                    _.forEach(finds, function (v, k) {
                        if (v.year) y.push(v.id);
                    });
                    Vacation.destroy(y, (err) => {
                        if (err) return next(err);
                        console.log('Отпуска удалил:', req.session.me);
                        console.log('Отпуски удалены:', finds);
                        sails.sockets.broadcast('vacation', 'badges-vacation', {
                            badges: [{name: 'Удалены зависимости графика отпусков ' + req.param('year'), delimiter: true}],
                            action: 'удалён',
                            shortName: findUser.getShortName(),
                            fullName: findUser.getFullName(),
                            avatarUrl: findUser.avatarUrl
                        }, req);
                        //return res.view('page/showhomepage', { me: req.session.me});
                        return res.redirect('/admin/schedules');
                    });
                });
        });
    },

    /**
     * Кол-во дней оставшихся на отпуск в следующем году
     */
    getDaysPeriodYear: function (req, res) {
        Interface.create(req, res);
        //User.findOne({id: '58e35656594105801c9d9203'})
            User.findOne({id: req.session.me})
            .populate('interfaces')
            .populate('vacations')
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                let intfaceYear = (findUser['interfaces'].length) ? findUser['interfaces'][0].year : moment().get('year');
                let year = (req.param('year')) ? req.param('year') : intfaceYear;

                Vacation.find({
                    where: {
                        //owner: '58e35656594105801c9d9203',
                        owner: req.session.me,
                        //furlough: ObjectId(req.param('furlough')),
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
                            },

                        ]
                    }
                }).exec((err, findVacations) => {
                    if (err) return res.serverError(err);
                    if (!findVacations) return res.notFound();
                    let obj = {};

                    // Праздники в RF
                    let holidaysRf = sails.config.holidaysRf.data;
                    //let holidaysRf = ["01.01.2017", "02.01.2017", "03.01.2017", "04.01.2017", "05.01.2017", "06.01.2017", "07.01.2017", "08.01.2017", "23.02.2017", "08.03.2017", "01.05.2017", "09.05.2017", "12.06.2017", "04.11.2017", "01.01.2018", "02.01.2018", "03.01.2018", "04.01.2018", "05.01.2018", "06.01.2018", "07.01.2018", "08.01.2018", "23.02.2018", "08.03.2018", "01.05.2018", "09.05.2018", "12.06.2018", "04.11.2018", "01.01.2019", "02.01.2019", "03.01.2019", "04.01.2019", "05.01.2019", "06.01.2019", "07.01.2019", "08.01.2019", "23.02.2019", "08.03.2019", "01.05.2019", "09.05.2019", "12.06.2019", "04.11.2019"];


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
    },

    /**
     * Кол-во дней взятых на отпуск конкретным пользователем
     */
    daysInYear: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        console.log(req.params.all());

        if (req.param('owner') === 'undefined') return res.badRequest();

        console.log('REGSSS', req.params.all());
        Vacation.native(function (err, collection) {
            if (err) return res.serverError(err);
            //collection.aggregate([{$match:{owner:ObjectId(req.param('owner')),action:true}},{$group:{'_id':'$year',selected:{$sum:'$daysSelectHoliday'}}},{ $project:{selected:1,year:1,remains:{$subtract:[28,"$selected"]}}}])
            collection.aggregate([{$match: {owner: ObjectId(req.param('owner')), action: true}}, {
                    $group: {
                        '_id': '$year',
                        selected: {$sum: '$daysSelectHoliday'}
                    }
                }, {$lookup: {from: "schedule", localField: "_id", foreignField: "_id", as: "schedule_docs"}}, {
                    $project: {
                        selected: 1,
                        schedule_docs: 1,
                        remains: {$subtract: [28, "$selected"]}
                    }
                }])
                .toArray(function (err, results) {
                    if (err) return res.serverError(err);
                    if (!results.length) return res.ok({count: 0});
                    let ar = [];
                    _.forEach(results, function (value) {
                        console.log(value.schedule_docs[0].year);

                        value.year = value.schedule_docs[0].year;
                        value.schedule_docs = '';
                        ar.push(value);

                    });
                    res.send(ar);


                });
        });

    },


    /**
     * Список годов доступных для вывода в селектор года
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
                return res.send(results);
            });
        });
    },


    /**
     * Отпуска из списка пересечений
     */
    getIntersections: function (req, res) {
        let userID = (req.param('id')) ? req.param('id') : req.session.me;
        User.findOne({id: userID})
            .populate('intersections')
            .populate('vacations')
            .exec((err, user) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!user) return res.badRequest();
                if (!user.intersections.length) return res.ok();
                let ar = [];
                _.forEach(user.intersections, function (val, key) {
                    ar.push(val.id);
                });
                Vacation.find({where: {owner: ar}}, {sort: 'from'})
                    .populate('furlough')
                    .populate('owner', {sort: 'lastName'})
                    .exec((err, vacationsFind) => {
                        if (err) return res.serverError(err);
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
     * Кол-во дней оставшихся по годам на отпуск
     */
    getDaysToYears: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        // db.vacation.aggregate([{$match:{$and:[{from:{$gte: ISODate("2018-01-01")}},{from:{$lt: ISODate("2019-01-01")}},{action: {$eq: true}}, {owner:ObjectId('58a461e66723246b6c2bc641')}]}}, {$group:{'_id':'$owner',selected:{$sum:'$daysSelectHoliday'}}}, { $project:{selected:1,remains:{$subtract:[28,"$selected"]}}}])
        console.log('ALL ZAPROS: ', req.params.all());
        Vacation.native(function (err, collection) {
            if (err) return res.serverError(err);
            //console.log('BODY', req.param('year'));
            //console.log('MOMENT YEAR',new Date(moment(req.param('year'),['YYYY'])));
//             collection.aggregate([{$match:{owner:ObjectId(req.param('owner')),action:true}},{$group:{'_id':'$owner',selected:{$sum:'$daysSelectHoliday'}}},{ $project:{selected:1,remains:{$subtract:[28,"$selected"]}}}])
            collection.aggregate([{$match: {$and: [{from: {$gte: new Date(moment(req.param('year'), ['YYYY']))}}, {from: {$lt: new Date(moment(req.param('year'), ['YYYY']).endOf("year"))}}, {furlough: ObjectId(req.param('furlough'))}, {action: {$eq: true}}, {owner: ObjectId(req.param('owner'))}]}}, {
                    $group: {
                        '_id': '$owner',
                        selected: {$sum: '$daysSelectHoliday'}
                    }
                }, {$project: {selected: 1, remains: {$subtract: [28, "$selected"]}}}])
                .toArray(function (err, results) {
                    if (err) return res.serverError(err);
                    console.log('SEND RESULT:', results);
                    res.send(results);
                });
        });
    },


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
        Vacation.subscribe(req, req.param('id'));

        // Присоединитесь к комнате отпуска для анимации ввода
        sails.sockets.join(req, 'vacation' + req.param('id'));
        // Vacation.watch(req);
        //console.log('Connect chat ' + 'vacation' + req.param('id'));
        return res.ok();
    },


    chat: function (req, res) {
        if (req.param('message').length > 900) {
            return res.badRequest('Сообщение слишком длинное.');
        }
        // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
        if (!req.isSocket) return res.badRequest();

        // TODO: ^ pull this into a `isSocketRequest` policy


        User.findOne({
                id: req.session.me
            })
            .exec(function (err, foundUser) {
                if (err) return res.negotiate(err);
                if (!foundUser) return res.notFound();

                // Трансляция события WebSocket всем остальным, находящимся в настоящее время в сети,
                // поэтому их  агенты могут обновлять интерфейс для них.
                //Vacation.publishUpdate(req.param('id'), {
                //    message: req.param('message'),
                //    username: foundUser.getFullName(),
                //    created: 'только сейчас',
                //    avatarURL: foundUser.avatarURL
                //});

                let obj = {
                    message: req.param('message'),
                    name: req.param('message'),
                    sender: req.session.me,
                    vacation: req.param('id'),
                    avatarUrl: foundUser.avatarUrl,
                    username: foundUser.getLastFirstName()
                };


                Chat.create(obj).exec(function (err, createdChat) {
                    if (err) return res.negotiate(err);


                    sails.sockets.broadcast('vacation' + obj.vacation, 'vacation', {
                        message: req.param('message'),
                        name: req.param('message'),
                        username: foundUser.getLastFirstName(),
                        created: 'только сейчас',
                        avatarUrl: foundUser.avatarUrl,
                        sender: req.session.me
                    });
                    // createdChat.id = req.param('id');
                    sails.sockets.broadcast('vacation', 'badges-vacation', {
                        badges: [createdChat],
                        timeUpdate: createdChat.updatedAt,
                        action: 'новое сообщение',
                        shortName: foundUser.getShortName(),
                        fullName: foundUser.getFullName(),
                        fi: foundUser.getLastFirstName(),
                        avatarUrl: foundUser.avatarUrl,
                        userId: foundUser.id, // кто отправил
                        vacationId: obj.vacation // id отпуска
                        //sender: req.session.me, // кто отправил
                    }, req);

                    let strEmail = '';

                    if (_.isArray(foundUser.matchings) && (foundUser.matchings.length > 0)) {
                        let a = [];
                        _.forEach(foundUser.matchings, function (val, key) {
                            //console.log('EMAIl:', val.email);
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
    ,

    ///**
    // * SOCKET событие hello
    // * @param req
    // * @param res
    // * @returns {*}
    // */
    hello: function (req, res) {

        /**
         * TODO SOCKET
         * Убедитьсь, что это запрос сокета, а не традиционный HTTP
         */
        if (!req.isSocket) {
            return res.badRequest();
        }
        // Попросите сокет, который сделал запрос, присоединиться к комнате «vacation».
        sails.sockets.join(req, 'vacation');


        // Передавать уведомление всем сокетам, которые присоединились
        // к комнате «list», за исключением нашего нового добавленного сокета:
        //sails.sockets.broadcast('schedule', 'hello', {howdy: 'hi there!'}, req);


        /**
         * На данный момент мы отправили сообщение сокета всем сокетам, у которых есть
         * подключение к комнате «list». Но это не обязательно означает, что они
         * are _listening_. Другими словами, чтобы фактически обрабатывать сообщение сокета,
         * подключенные сокеты должны прослушивать это конкретное событие (в этом
         * case, мы передали наше сообщение с именем события «hello»).
         * клиентская сторона, которую вам нужно написать, выглядит следующим образом:
         *
         *  io.socket.on('hello', function (broadcastedData){
         *  // => 'hi there!'
         *  }
         */

        /**
         * Теперь, когда мы транслируем наше сообщение сокету, нам все равно нужно продолжить
         * с любой другой логикой, о которой мы должны заботиться в наших действиях, а затем отправить
         * ответ. В этом случае мы как раз завернуты, поэтому мы продолжим
         * Ответьте на запрос с помощью 200 OK.
         * Возвращенные данные - это то, что мы получили на клиенте как «данные» в:
         * `io.socket.get ('/ say / hello', функция gotResponse (data, jwRes) {/ * ... * /});`
         */
        return res.json({
            anyData: 'Вы подключились к комнате vacation и слушаете событие hello'
        });

        /**
         * TODO END SOCKET
         */
    },

    /**
     * SOCKET событие badges
     * @param req
     * @param res
     * @returns {*}
     */
    badges: function (req, res) {
        /**
         * TODO SOCKET
         * Убедитьсь, что это запрос сокета, а не традиционный HTTP
         */
        if (!req.isSocket) {
            return res.badRequest();
        }
        // Попросите сокет, который сделал запрос, присоединиться к комнате «list».
        sails.sockets.join(req, 'vacation');


        // Передавать уведомление всем сокетам, которые присоединились
        // к комнате «vacation», за исключением нашего нового добавленного сокета:
        //sails.sockets.broadcast('schedule', 'hello', {howdy: 'hi there!'}, req);


        /**
         * На данный момент мы отправили сообщение сокета всем сокетам, у которых есть
         * подключение к комнате «vacation». Но это не обязательно означает, что они
         * are _listening_. Другими словами, чтобы фактически обрабатывать сообщение сокета,
         * подключенные сокеты должны прослушивать это конкретное событие (в этом
         * case, мы передали наше сообщение с именем события «hello»).
         * клиентская сторона, которую вам нужно написать, выглядит следующим образом:
         *
         *  io.socket.on('hello', function (broadcastedData){
         *  // => 'hi there!'
         *  }
         */

        /**
         * Теперь, когда мы транслируем наше сообщение сокету, нам все равно нужно продолжить
         * с любой другой логикой, о которой мы должны заботиться в наших действиях, а затем отправить
         * ответ. В этом случае мы как раз завернуты, поэтому мы продолжим
         * Ответьте на запрос с помощью 200 OK.
         * Возвращенные данные - это то, что мы получили на клиенте как «данные» в:
         * `io.socket.get ('/ say / hello', функция gotResponse (data, jwRes) {/ * ... * /});`
         */
        return res.json({
            anyData: 'Вы подключились к комнате vacation и слушаете событие badges'
        });

        /**
         * TODO END SOCKET
         */
    }
}
;

