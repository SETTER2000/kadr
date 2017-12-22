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
var CronJob = require('cron').CronJob;
const moment = MomentRange.extendMoment(Moment);
moment.locale('ru');
var arrJobs = [];
const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs');
const http = require('http');
var job = {};

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

        //console.log('QUERY', q);
        if (req.param('id')) {
            //console.log('VACTION ID:', req.param('id'));
            Schedule.findOne(req.param('id'))
                .populate('whomCreated')
                .populate('whomUpdated')
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
                //.populate('vacations')
                //.populate('positions')
                .populate('interfaces')
                .exec(function foundVacation(err, findOneUser) {
                    if (err) return res.serverError(err);
                    if (!findOneUser) return res.notFound();
                    //if (!findOneUser.interfaces.length) {
                    //    console.log('ОШИБКА! Нет свойства "год" в коллекции Interface, у пользователя ' +
                    //        findOneUser.lastName + ' ' + findOneUser.firstName +
                    //        '. Перейдите по ссылке http://' + req.headers.host + '/interface/create');
                    //
                    //    return res.badRequest('ВНИМАНИЕ! Отсутствует свойство "год" в коллекции' +
                    //        '. Перейдите по ссылке http://' + req.headers.host + '/interface/create');
                    //}
                    //let from = {$gte: new Date(moment(findOneUser.interfaces[0].year, ["YYYY"]).startOf("year"))};
                    User.find(q)
                        //.populate('vacations')
                        //.populate('positions')
                        .populate('interfaces')
                        .exec(function foundUser(err, users) {
                            if (err) return res.serverError(err);
                            if (!users) return res.notFound();
                            //let us = [];
                            //_.forEach(users, function (user) {
                            //    let ob = {};
                            //    ob.from = from;
                            //    ob.owner = user.id;
                            //    //console.log('user.id === req.session.me', user.id +'=== '+req.session.me);
                            //    //if (user.id === req.session.me) {
                            //    //    console.log('FIO:::', ob.from= new Date(moment(user.interfaces[0].year, ["YYYY"]).startOf("year")));
                            //    //}
                            //    //console.log('UIP: ', user);
                            //    //console.log('LENGTH: ', user.vacations.length);
                            //    //if (user.vacations.length > 0) us.push({'owner': user.id});
                            //    us.push(ob);
                            //});
                            //
                            ////console.log('ОТОБРАННЫЕ:', us);
                            ////console.log('USER ODIN:', users[0]);
                            ////console.log('DDDDDDDDDDDDDDASreq.session :', req.session.me);
                            Schedule.find()
                                .populate('whomCreated')
                                .populate('whomUpdated')
                                .exec(function foundSchedule(err, schedules) {
                                    if (err) return res.serverError(err);
                                    if (!schedules) return res.notFound();

                                    //_.forEach(schedules, function (vaca) {
                                    //    console.log('FROMUSHKA: ', vaca.from);
                                    //});
                                    // assuming openFiles is an array of file names
                                    async.each(schedules, function (file, callback) {

                                        // Perform operation on file here.
                                        console.log('Обработан файл ', file.year);

                                        if (file.length > 32) {
                                            console.log('Это имя слишком длинное');
                                            callback('Слишком длинное имя файла');
                                        } else {
                                            // Do work to process file here
                                            //console.log('Обработан файл');

                                            Vacation.find({
                                                from: {
                                                    '>=': new Date(moment(file.year, ["YYYY"])),
                                                    '<': new Date(moment(file.year, ["YYYY"]).add(1, 'year'))
                                                }
                                            }).exec((err, findVacation) => {
                                                if (err) res.serverError(err);
                                                //console.log('moment(file.year, ["YYYY"])', moment(file.year, ["YYYY"]));
                                                //console.log('moment(file.year, ["YYYY"]+++)',moment(file.year, ["YYYY"]).add(1, 'year'));
                                                console.log('findVacation: ' + file.year + ' ', findVacation.length);
                                            });


                                            callback();
                                        }
                                    }, function (err) {
                                        // if any of the file processing produced an error, err would equal that error
                                        if (err) {
                                            // One of the iterations produced an error.
                                            // All processing will now stop.
                                            console.log('Не удалось обработать файл');
                                        } else {
                                            console.log('Все файлы успешно обработаны');
                                        }
                                    });
                                    console.log('VACA', schedules.length);
                                    res.send(schedules);


                                    /**
                                     * Выбрать пользователей и суммировать их выбранные дни на отпуск планируемого года
                                     */

                                    // db.vacation.aggregate([{$match:{$and:[{from:{$gte:ISODate("2017-01-01")}},{from:{$lt:ISODate("2018-01-01")}},{action:{$eq:true}}]}},{$group:{'_id':'$owner', count:{$sum:'$daysSelectHoliday'}}}]).pretty()

                                    /**
                                     * Выбрать пользователей которые запланировали отпуска на установленый год.
                                     * т.е. сумма дней взятых на отпуск в плановом году больше или равна 28 дням
                                     * Если planned = true - лимит выбран
                                     */

                                    /*
                                     db.vacation.aggregate([
                                     {$match:{ $and:[{from:{$gte: ISODate("2017-01-01")}},{from:{$lt: ISODate("2018-01-01")}},{action: {$eq: true}}]}},
                                     {$group: {
                                     '_id': '$owner',count: {$sum: '$daysSelectHoliday'}
                                     } },
                                     {$project:{_id:1, count:1, planned:{$cond:{if:{$gte:['$count',28]}, then:true, else:false}}}}
                                     ]).pretty()
                                     */


                                });
                        });
                });
        }

    }
    ,


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
            //daysSelectHoliday: +req.param('daysSelectHoliday'),
            //whomCreated: req.session.me,
            whomCreated: req.session.me,
            daysSelectHoliday: req.param('daysSelectHoliday'),
            action: req.param('action'),
            period: req.param('period'),
            //maxTwoWeek: req.param('maxTwoWeek'),
            status: 'Проект',
            start: new Date(req.param('start')),
            year: +req.param('year'),
            countData: +req.param('countData'),
            htmlData: req.param('htmlData'),
            idleStart: '',
            worked: moment().isSameOrAfter(moment(new Date(req.param('start')), ['X'])),
            //owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
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
                            //findUser.vacations.add(createSchedule.id);
                            findUser.scheduleWhomCreated.add(createSchedule.id);
                            findUser.save(function (err) {
                                if (err) {
                                    return res.serverError(err);
                                }
                                //sails.sockets.broadcast('schedule', 'hello', {howdy: createSchedule}, req);
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

                            //job.start();

                            //sails.on('event', () => {
                            //    console.log('СОБЫТИЕ!!!!', 'an event occurred!');
                            //});
                            //
                            //sails.emit('event');

                        });
                });
        });

    }
    ,


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
                    .populate('whomUpdated').exec((err, objEdit) =>{
                    console.log(err);
                        if (err) return res.negotiate(err);
                        findUser.save(function (err) {
                            if (err) return res.negotiate(err);
                            Schedule.find().exec((err, findsSchedule) => {
                                if (err) return res.serverError(err);
                                sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule}, req);
                                console.log('objEdit', findUser);
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
    }
    ,


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
                // assuming openFiles is an array of file names
                //async.each(usersFind, function(file, callback) {
                //
                //    // Perform operation on file here.
                //    console.log('Processing file ' + file);
                //    a.push(file.email);
                //    if( file.length > 32 ) {
                //        console.log('This file name is too long');
                //        callback('File name too long');
                //    } else {
                //        // Do work to process file here
                //        console.log('File processed');
                //        callback();
                //    }
                //}, function(err) {
                //    // if any of the file processing produced an error, err would equal that error
                //    if( err ) {
                //        // One of the iterations produced an error.
                //        // All processing will now stop.
                //        console.log('A file failed to process');
                //    } else {
                //        console.log('All files have been processed successfully');
                //    }
                //});
                strEmail = a.join(',');
            }
            sails.log('Email для рассылки: ', strEmail);

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
        User.findOne({id: req.session.me}).exec((err, finOneUser) => {
            "use strict";
            if (err) return res.serverError(err);


            Schedule.findOne(req.param('id')).exec((err, finds) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!finds) return res.notFound();
                //console.log('DELETE OBJ: ', arrJobs.length);
                //(arrJobs.length > 0) ? console.log('_idleStart STR: ', arrJobs[0]._timeout._idleStart) : '';
                //console.log('START: ', finds.start);

                Schedule.destroy({id: finds.id}, (err) => {
                    if (err) return next(err);
                    console.log('Отпуск удалил:', req.session.me);
                    console.log('Отпуск удалён:', finds);
                    Schedule.find().exec((err, findSchedule) => {
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
    }
    ,

    /**
     * Обновить 'кол-во строк в таблице' пользователю
     * @param req
     * @param res
     */
    updateDefaultRows: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        console.log('req in', req.param('defaultRows'));
        Schedule.update(req.session.me, {
                defaultRows: req.param('defaultRows')
            })
            .exec(function (err, update) {
                if (err) return res.negotiate(err);
                //console.log('req out', update);
                return res.ok(update);
            });
    }
    ,
    /**
     * Возвращает максимальный номер года
     * на который есть график отпусков
     * @param req
     * @param res
     */
    maxYear: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Schedule.find({sort: 'year DESC',  action:true,limit: 1}).exec((err, findOne)=> {
            "use strict";
            if (err) res.serverError(err);
            console.log('findOne', findOne);
            //sails.sockets.broadcast('schedule', 'hello', {howdy: {name:findOne[0].year}}, req);
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
        Schedule.find({sort: 'year', action:true, limit: 1}).exec((err, findOne)=> {
            "use strict";
            if (err) res.serverError(err);
            console.log('findOne', findOne);
            res.ok(findOne[0]);
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
            anyData: 'we want to send hello'
        });

        /**
         * TODO END SOCKET
         */
    }
    ,

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
            anyData: 'we want to send badges'
        });

        /**
         * TODO END SOCKET
         */
    }
}
;

