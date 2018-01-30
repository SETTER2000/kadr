/**
 * ScheduleController
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
const async = require('async');
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
        if (req.param('id')) {
            Schedule.findOne(req.param('id'))
                .populate('whomCreated')
                .populate('whomUpdated')
                .populate('vacations')
                .exec(function foundVacation(err, vacations) {
                    if (err) return res.serverError(err);
                    if (!vacations) return res.notFound();
                    return res.ok(vacations);
                });
        }
        else {
            User.findOne({id: req.session.me})
                .populate('interfaces')
                .exec(function foundVacation(err, findOneUser) {
                    if (err) return res.serverError(err);
                    if (!findOneUser) return res.notFound();
                    User.find(q)
                        .populate('interfaces')
                        .exec(function foundUser(err, users) {
                            if (err) return res.serverError(err);
                            if (!users) return res.notFound();

                          /*  {
                                where: { /!* ... *!/ },
                                groupBy: [ /!* ... *!/ ],
                                    sum: [ /!* ... *!/ ],
                                average: [ /!* ... *!/ ],
                                count: true,
                                min: [ /!* ... *!/ ],
                                max: [ /!* ... *!/ ],
                                sort: { /!* ... *!/ },
                                skip: 2353,
                                    limit: 25
                            }*/
                            Schedule.find()
                                .populate('whomCreated')
                                .populate('whomUpdated')
                                .populate('vacations', {
                                    //where: {
                                    //   from: { '>=': new Date('2018-01-01'), '<': new Date('2019-01-01') }
                                    //},
                                    //limit: 3,
                                    //sort: 'hipness DESC'
                                })
                                .exec(function foundSchedule(err, schedules) {
                                    if (err) return res.serverError(err);
                                    if (!schedules) return res.notFound();
                                    async.each(schedules, function (file, callback) {
                                        if (file.length > 32) {
                                            console.log('Это имя слишком длинное');
                                            callback('Слишком длинное имя файла');
                                        } else {
                                            Vacation.find({
                                                from: {
                                                    '>=': new Date(moment(file.year, ["YYYY"])),
                                                    '<': new Date(moment(file.year, ["YYYY"]).add(1, 'year'))
                                                }
                                            }).exec((err, findVacation) => {
                                                if (err) res.serverError(err);
                                            });
                                            callback();
                                        }
                                    }, function (err) {
                                        if (err) {
                                            console.log('Не удалось обработать файл');
                                        } else {
                                            //console.log('Все файлы успешно обработаны');
                                        }
                                    });
                                    res.send(schedules);
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
        //if (!_.isNumber(req.param('daysSelectHoliday'))) return res.negotiate('Кол-во дней не число.');
        if (moment().isSameOrAfter(req.param('start'))) return res.badRequest('ВНИМАНИЕ! График просрочен.');
        let obj = {
            section: 'График отпусков',
            sections: 'Графики отпусков',
            name: req.param('name'),
            whomCreated: req.session.me,
            daysSelectHoliday: req.param('daysSelectHoliday'),
            action: req.param('action'),
            period: req.param('period'),
            status: 'Проект',
            start: new Date(req.param('start')),
            year: +req.param('year'),
            countData: +req.param('countData'),
            htmlData: req.param('htmlData'),
            idleStart: '',
            worked: moment().isSameOrAfter(moment(new Date(req.param('start')), ['X'])),
            from: new Date(req.param('from')),
            to: new Date(req.param('to'))
        };

        Schedule.find({year: obj.year}).exec((err, findSchedule) => {
            if (err) return res.serverError(err);
            if (findSchedule.length > 0) return res.badRequest('На ' + obj.year + ' год уже есть график отпусков.');
            User.findOne({id: obj.whomCreated})
                .exec((err, findUser) => {
                    Schedule.create(obj)
                        .exec(function (err, createSchedule) {
                            if (err) return res.serverError(err);
                            console.log(obj.section + ' создан пользователем:', findUser.getFullName());
                            findUser.scheduleWhomCreated.add(createSchedule.id);
                            findUser.save(function (err) {
                                if (err) {
                                    return res.serverError(err);
                                }
                                Schedule.find().exec((err, findSchedule) => {
                                    if (err) return res.serverError(err);
                                    sails.sockets.broadcast('schedule', 'hello', {howdy: findSchedule}, req);
                                    sails.sockets.broadcast('schedule', 'badges', {
                                        badges: [createSchedule],
                                        action: 'создан',
                                        shortName: findUser.getShortName(),
                                        fullName: findUser.getFullName(),
                                        avatarUrl: findUser.avatarUrl
                                    }, req);
                                    res.send(createSchedule);
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
        if (moment().isSameOrAfter(req.param('start'))) return res.badRequest('ВНИМАНИЕ! График просрочен.');
        let obj = {
            section: 'График отпусков',
            sections: 'Графики отпусков',
            name: req.param('name'),
            whomUpdated: req.session.me,
            daysSelectHoliday: req.param('daysSelectHoliday'),
            action: req.param('action'),
            period: req.param('period'),
            status: (moment().isSameOrAfter(moment(new Date(req.param('start')), ['X']))) ? 'В работе' : 'Проект',
            htmlData: req.param('htmlData'),
            start: new Date(req.param('start')),
            year: +req.param('year'),
            from: new Date(req.param('from')),
            to: new Date(req.param('to')),
            worked: moment().isSameOrAfter(moment(new Date(req.param('start')), ['X']))
        };
        ((obj.status === 'Проект') || (obj.status === 'В работе')) ? obj.countData = +req.param('countData') : '';
        User.findOne({id: obj.whomUpdated})
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                Schedule.update(req.param('id'), obj)
                    .populate('whomCreated')
                    .populate('whomUpdated').exec((err, objEdit) => {
                    if (err) return res.negotiate(err);
                    findUser.save(function (err) {
                        if (err) return res.negotiate(err);
                        Schedule.find().exec((err, findsSchedule) => {
                            if (err) return res.serverError(err);
                            sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule}, req);
                            sails.sockets.broadcast('schedule', 'badges', {
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
    },


    /**
     * Собираем Email сотрудников для рассылки
     * уведомления о начале сбора отпусков на след. год
     * только активные учётки и только кто работает в данный момент
     *
     * @param req
     * @param res
     */
    ticket: function (req, res) {
        User.find({action: true, fired: false}).exec((err, usersFind) => {
            "use strict";
            if (err) return res.serverError(err);
            if (!usersFind) return res.notFound('Пользователи для получения рассылки не найдены.');
            let strEmail = '';
            if (_.isArray(usersFind) && (usersFind.length > 0)) {
                let a = [];
                _.forEach(usersFind, function (val, key) {
                    a.push(val.email);
                });
                strEmail = a.join(',');
            }
            //sails.log('Email для рассылки: ', strEmail);

            strEmail = (strEmail) ? strEmail : '';
            console.log('Создатель графика отпусков:', strEmail);

            let options = {
                to: strEmail, // Кому: можно несколько получателей указать через запятую
                subject: ' ✔ ' + obj.section + ' создал: ' + findUser.getFullName(), // Тема письма
                text: '<h2>Уведомление. ' + obj.section + ' запущен. </h2>', // plain text body
                html: '' +
                '<h2>' + obj.section + '.  </h2> ' +
                '<p>Вы создали ' + obj.section + ' с названием: ' + obj.name + '</p>' +
                '<p>Период сбора информации установлен:<br>c ' + moment(obj.from).format('llll') + '<br> по ' + moment(obj.to).format('llll') + '</p>' +
                '<p> В данный момент проект запущен.<br> Статус "' + obj.status + '" изменён на "' + updated[0].status + '".</p>' +
                '<p>Начало рассылки: ' + moment(obj.start).format('DD.MM.YYYY HH:mm:ss') + '' +
                '<br>Окончание рассылки: ' + moment(foo).format('DD.MM.YYYY HH:mm:ss') + '</p>' +
                '<p>Рассылка сообщений сотрудникам закончена.</p>'
            };
            EmailService.sender(options);
            res.send(createSchedule);
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
        User.findOne({id: req.session.me}).exec((err, finOneUser) => {
            "use strict";
            if (err) return res.serverError(err);
            Schedule.findOne(req.param('id'))
                .populate('vacations')
                .exec((err, finds) => {
                    "use strict";
                    if (err) return res.serverError(err);
                    if (!finds) return res.notFound();
                    if (finds.vacations.length > 0) return res.badRequest('График не может быть удалён, существуют зависимости. Сначала удалите все отпуска связаные с '+req.param('year')+' годом. <a class="kadr-link"  target="_blank" href="/vacation/delete-all/'+req.param('year')+'"><i class="fa fa-link" aria-hidden="true"></i> Удалить </a>');
                    Schedule.destroy({id: finds.id}, (err) => {
                        if (err) return next(err);
                        console.log('Отпуск удалил:', req.session.me);
                        console.log('Отпуск удалён:', finds);
                        Schedule.find()
                            .populate('vacations')
                            .exec((err, findSchedule) => {
                                if (err) return res.serverError(err);
                                sails.sockets.broadcast('schedule', 'hello', {howdy: findSchedule}, req);
                                sails.sockets.broadcast('schedule', 'badges', {
                                    badges: [finds],
                                    action: 'удалён',
                                    shortName: finOneUser.getShortName(),
                                    fullName: finOneUser.getFullName(),
                                    avatarUrl: finOneUser.avatarUrl
                                }, req);
                                res.ok();
                            });
                    });
                });
        });
    },


    /**
     * Обновить 'кол-во строк в таблице' пользователю
     * @param req
     * @param res
     */
    updateDefaultRows: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Schedule.update(req.session.me, {
                defaultRows: req.param('defaultRows')
            })
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                return res.ok(update);
            });
    },


    /**
     * Возвращает максимальный номер года
     * на который есть график отпусков
     * @param req
     * @param res
     */
    maxYear: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Schedule.find({sort: 'year DESC', action: true, limit: 1}).exec((err, findOne)=> {
            "use strict";
            if (err) res.serverError(err);
            res.ok(findOne[0]);

        });
    },


    /**
     * Возвращает минимальный номер года
     * на который есть график отпусков
     * @param req
     * @param res
     */
    minYear: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Schedule.find({sort: 'year', action: true, limit: 1}).exec((err, findOne)=> {
            "use strict";
            if (err) res.serverError(err);
            res.ok(findOne[0]);
        });
    },


    /**
     * Возвращает кол-во запланированных отпусков
     */
    getHolidaysToYears: function (req, res) {
        Vacation.native(function (err, collection) {
            if (err) return res.serverError(err);
            let start = new Date(moment(req.param('year'), ['YYYY']).format('YYYY-MM-DD'));
            let end = new Date(moment(req.param('year'), ['YYYY']).add(1, 'year').format('YYYY-MM-DD'));
            let y = 0;
            collection.aggregate([{$match: {$and: [{from: {$gte: start}}, {from: {$lt: end}}, {action: {$eq: true}}]}}, {
                    $group: {
                        _id: "$owner",
                        cntDs: {$sum: "$daysSelectHoliday"}
                    }
                }, {$project: {id: 1, summa: {$cond: {if: {$gte: ["$cntDs", 28]}, then: 1, else: 0}}}}])
                .toArray(function (err, results) {
                    if (err) return res.serverError(err);
                    //return results;
                    _.forEach(results, function (value, key) {
                        console.log('numSelected', value.summa);
                        y += value.summa;
                    });
                    //console.log('y', y);
                    return res.send({sumDays: y});
                });

        });


    },


    /**
     * SOCKET событие hello
     * @param req
     * @param res
     * @returns {*}
     */
    hello: function (req, res) {

        /**
         * TODO SOCKET
         * Убедитьсь, что это запрос сокета, а не традиционный HTTP
         */
        if (!req.isSocket) {
            return res.badRequest();
        }
        // Попросите сокет, который сделал запрос, присоединиться к комнате «list».
        sails.sockets.join(req, 'schedule');


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
         *  console.log(data.howdy);
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
            anyData: 'Вы подключились к комнате schedule и слушаете событие hello'
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
        sails.sockets.join(req, 'schedule');


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
         *  console.log(data.howdy);
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
            anyData: 'Вы подключились к комнате schedule и слушаете событие badges'
        });

        /**
         * TODO END SOCKET
         */
    }
};

