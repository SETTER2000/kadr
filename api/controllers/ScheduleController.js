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
var arrJobs=[];
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

                                    //_.forEach(vacations, function (vaca) {
                                    //    console.log('FROMUSHKA: ', vaca.from);
                                    //});
                                    //console.log('VACA', vacations);
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
            //furlough: req.param('furlough'),
            //owner: (req.param('owner')) ? req.param('owner').id : req.session.me,
            from: new Date(req.param('from')),
            to: new Date(req.param('to'))
        };

        Schedule.find({year: obj.year}).exec((err, findSchedule)=> {
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
                            //_.forEach(users, function (v, k) {
                            //    // console.log('Отпуска пересекаемые с нашим:', v.vacations);
                            //    if (_.isArray(v.vacations) && (v.vacations.length > 0)) {
                            //        _.forEach(v.vacations, function (val, key) {
                            //            createVacation.intersec.add(val.id)
                            //        });
                            //    }
                            //});
                            // console.log('findUser++:', findUser);
                            let strEmail = findUser.email;
                            //if (_.isArray(findUser.matchings) && (findUser.matchings.length > 0)) {
                            //    let a = [];
                            //    _.forEach(findUser.matchings, function (val, key) {
                            //        console.log('EMAIl:', val.email);
                            //        a.push(val.email);
                            //    });
                            //    strEmail = a.join(',');
                            //}


                            findUser.save(function (err) {
                                if (err) return res.negotiate(err);
                                strEmail = (strEmail) ? strEmail : '';
                                console.log('Создатель графика отпусков:', strEmail);
                                /**
                                 * Опции установки задачи cron
                                 * @type {{start, name}}
                                 * start : Object.Data
                                 * name: string
                                 */
                                //let taskOpt = {
                                //    start: req.param('start'),
                                //    name: req.param('name')
                                //};



                                let foo={};
                                let tsk = moment(obj.start);
                                let task = '* ' + tsk.get('minute') + ' ' + tsk.get('hour') + ' ' + tsk.date() + ' ' + (tsk.format('M')) + ' *';
                                try {
                                    let job  = new CronJob({
                                        cronTime: task,
                                        onTick: function () {
                                            console.log('Задача: ' + obj.name);
                                            console.log('Задача запущена в: ' + tsk.format("llll"));
                                            console.log('Время для Cron: ' + task);
                                            this.stop();
                                        },
                                        onComplete: function () {
                                            console.log('Задача выполнена в: ' + new Date());
                                            foo =  new Date();
                                            /**
                                             * Обновление статуса
                                             */
                                            Schedule.update({id: createSchedule.id}, {status: 'В работе'})
                                                .exec((err, updated)=> {
                                                    if (err) return res.serverError(err);
                                                    if (!updated.length) return res.ok('Задача: '+obj.name +' - удалена!');

                                                    console.log('Updated ::' + updated);

                                                    /**
                                                     * Опции для отправки сообщения
                                                     * @type {{to: *, subject: string, text: string, html: string}}
                                                     */
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
                                        start: true,
                                        startProject: tsk,
                                        period:obj.period,
                                        timeZone: zone
                                    });
                                    //job.start();
                                    arrJobs.push(job);
                                    sails.log('job status', job.running);
                                } catch (err) {
                                    console.log('Ошибка в CRON: '+ err);
                                    return res.negotiate(err);
                                }


                                console.log('arrJobs:' , arrJobs);

                                //CronService.task(taskOpt, (err, foo)=> {
                                //    "use strict";
                                //    if (err) {
                                //        sails.log('Ошибка в задачи CRON:' + err);
                                //        return res.negotiate(err);
                                //    }
                                //
                                //    sails.log('FOO: ', foo);
                                //    if (!foo.running) {
                                //        foo.stop();
                                //        return res.badRequest('Задача снята! +++');
                                //    }

                                    ///**
                                    // * Обновление статуса
                                    // */
                                    //Schedule.update({id: createSchedule.id}, {status: 'В работе'})
                                    //    .exec((err, updated)=> {
                                    //        if (err) return res.serverError(err);
                                    //        if (!updated) return res.badRequest('Задача снята!');
                                    //
                                    //        console.log('Updated ::' + updated);
                                    //
                                    //        /**
                                    //         * Опции для отправки сообщения
                                    //         * @type {{to: *, subject: string, text: string, html: string}}
                                    //         */
                                    //        let options = {
                                    //            to: strEmail, // Кому: можно несколько получателей указать через запятую
                                    //            subject: ' ✔ ' + obj.section + ' создал: ' + findUser.getFullName(), // Тема письма
                                    //            text: '<h2>Уведомление. ' + obj.section + ' запущен. </h2>', // plain text body
                                    //            html: '' +
                                    //            '<h2>' + obj.section + '.  </h2> ' +
                                    //            '<p>Вы создали ' + obj.section + ' с названием: ' + obj.name + '</p>' +
                                    //            '<p>Период сбора информации установлен:<br>c ' + moment(obj.from).format('llll') + '<br> по ' + moment(obj.to).format('llll') + '</p>' +
                                    //            '<p> В данный момент проект запущен.<br> Статус "' + obj.status + '" изменён на "' + updated[0].status + '".</p>' +
                                    //            '<p>Начало рассылки: ' + moment(obj.start).format('DD.MM.YYYY HH:mm:ss') + '' +
                                    //            '<br>Окончание рассылки: ' + moment(foo).format('DD.MM.YYYY HH:mm:ss') + '</p>' +
                                    //            '<p>Рассылка сообщений сотрудникам закончена.</p>'
                                    //        };
                                    //        EmailService.sender(options);
                                    //        res.send(createSchedule);
                                    //    });
                                //});
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
        let tm = moment(req.param('start'));
        let task = '* ' + tm.get('minute') + ' ' + tm.get('hour') + ' ' + tm.date() + ' ' + (tm.format('M')) + ' *';

        let job = new CronJob({
            cronTime: task,
            onTick: function () {
                console.log('Задача: ' + req.param('name'));
                console.log('Задача должна быть запущена в: ' + moment(req.param('start')).format("LLLL"));
                console.log('Время для Cron: ' + task);
                this.stop();
            },
            onComplete: function () {
                console.log('Задача выполнена в: ' + new Date());

            },
            start: false,
            timeZone: 'Europe/Moscow'
        });
        job.start();


        //new CronJob(task, function() {
        //    console.log('Задача должна быть запущена в: ' + moment(req.param('start')));
        //    console.log('Время для Cron: ' + task);
        //}, function () {
        //    console.log('Задача выполнена в: ' + new Date());
        //    this.stop();
        //}, true, 'Europe/Moscow');
        //let secondJob = sails.hooks.cron.jobs.secondJob;
        //console.log('firstJob.cronTime.source', firstJob);
        //console.log('DATE START: ', moment(req.param('start')).format('LLLL'));
        //console.log('TASK: ', task);

        let obj = {
            section: 'График отпусков',
            sections: 'Графики отпусков',
            name: req.param('name'),
            whomUpdated: req.session.me,
            daysSelectHoliday: req.param('daysSelectHoliday'),
            action: req.param('action'),
            period: req.param('period'),
            status: req.param('status'),
            htmlData: req.param('htmlData'),
            start: new Date(req.param('start')),
            year: +req.param('year'),
            from: new Date(req.param('from')),
            to: new Date(req.param('to'))
        };

        ((obj.status === 'Проект') || (obj.status === 'В работе')) ? obj.countData = +req.param('countData') : '';

        User.findOne({id: obj.whomUpdated})
            .exec((err, findUser) => {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();

                Schedule.update(req.param('id'), obj)
                    .populate('whomCreated')
                    .populate('whomUpdated')
                    .exec(function updateObj(err, objEdit) {
                        if (err) return res.negotiate(err);
                        sails.log(obj.section + 'обновлён: ', objEdit);
                        sails.log(obj.section + ' обновлён пользователем:', findUser.getFullName());
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
    },


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
    },


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


    /**
     * Чат отпуска
     * @param req
     * @param res
     * @returns {*}
     */
    //joinChat: function (req, res) {
    //
    //    // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
    //    if (!req.isSocket) {
    //        return res.badRequest();
    //    }
    //    // TODO: ^ Потяните это в политику `isSocketRequest`
    //
    //    // Присоединитесь к комнате для этого отпуска (в качестве запрашивающего сокета)
    //    Schedule.subscribe(req, req.param('id'));
    //
    //    // Присоединитесь к комнате отпуска для анимации ввода
    //    sails.sockets.join(req, 'vacation' + req.param('id'));
    //    // Schedule.watch(req);
    //    console.log('Connect chat ' + 'vacation' + req.param('id'));
    //    return res.ok();
    //}
    //,


    //chat: function (req, res) {
    //    console.log(' vacation', req.param('id'));
    //    console.log(' message', req.param('message'));
    //    console.log('sender me', req.session.me);
    //    console.log('REQ me', req.session);
    //    var values = req.allParams();
    //    console.log('REQ host', values);
    //    console.log('REQ host', req.host);
    //    console.log('REQ .subdomains', req.subdomains);
    //    console.log('REQ .body', req.body);
    //    // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
    //    if (!req.isSocket) {
    //        return res.badRequest();
    //    }
    //    // TODO: ^ pull this into a `isSocketRequest` policy
    //
    //
    //    User.findOne({
    //            id: req.session.me
    //        })
    //        .exec(function (err, foundUser) {
    //            if (err) return res.negotiate(err);
    //            if (!foundUser) return res.notFound();
    //
    //            // Трансляция события WebSocket всем остальным, находящимся в настоящее время в сети,
    //            // поэтому их пользователь
    //            // агенты могут обновлять интерфейс для них.
    //            //console.log('foundUser', foundUser);
    //            //Schedule.publishUpdate(req.param('id'), {
    //            //    message: req.param('message'),
    //            //    username: foundUser.getFullName(),
    //            //    created: 'только сейчас',
    //            //    avatarURL: foundUser.avatarURL
    //            //});
    //            Chat.create({
    //                message: req.param('message'),
    //                sender: req.session.me,
    //                vacation: req.param('id'),
    //                avatarUrl: foundUser.avatarUrl,
    //                username: foundUser.getShortName()
    //            }).exec(function (err, createdChat) {
    //                if (err) return res.negotiate(err);
    //
    //
    //                sails.sockets.broadcast('vacation' + req.param('id'), 'vacation', {
    //                    message: req.param('message'),
    //                    username: foundUser.getShortName(),
    //                    created: 'только сейчас',
    //                    avatarUrl: foundUser.avatarUrl
    //                });
    //
    //
    //                let strEmail = '';
    //
    //                if (_.isArray(foundUser.matchings) && (foundUser.matchings.length > 0)) {
    //                    let a = [];
    //                    _.forEach(foundUser.matchings, function (val, key) {
    //                        console.log('EMAIl:', val.email);
    //                        a.push(val.email);
    //                    });
    //                    strEmail = a.join(',');
    //                }
    //
    //                let options = {
    //                    to: strEmail, // Кому: можно несколько получателей указать через запятую
    //                    subject: ' ! Чат отпуска ' + req.param('name') + '! Сообщение от ' + foundUser.getFullName(), // Тема письма
    //                    text: '<h2>Сообщение чата </h2>', // plain text body
    //                    html: '' +
    //                    '<h2>У Вас есть новое сообщение. </h2> ' +
    //                    '<p>' + req.param('message') + '</p>' +
    //                    '<p><a href="' + sails.config.appUrl.http + '/admin/vacations/edit/' + req.param('id') + '">перейти в чат</a></p>'
    //
    //                };
    //                EmailService.sender(options);
    //
    //                return res.ok();
    //
    //            });
    //        });
    //}
    //,
    //
    //typing: function (req, res) {
    //
    //    // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
    //    if (!req.isSocket) {
    //        return res.badRequest();
    //    }
    //    // TODO: ^ pull this into a `isSocketRequest` policy
    //
    //    User.findOne({
    //        id: req.session.me
    //    }).exec(function (err, foundUser) {
    //        if (err) return res.negotiate(err);
    //        if (!foundUser) return res.notFound();
    //
    //        // Событие сокетов Broadcast для всех остальных в настоящее время в сети, чтобы их пользовательские агенты
    //        // может обновить интерфейс для них.
    //        sails.sockets.broadcast('vacation' + req.param('id'), 'typing', {
    //            username: foundUser.getFullName()
    //        }, (req.isSocket ? req : undefined));
    //
    //        return res.ok();
    //    });
    //}
    //,

    //stoppedTyping: function (req, res) {
    //
    //    // Ничто, кроме запросов сокетов, никогда не должно ударять по этой конечной точке.
    //    if (!req.isSocket) {
    //        return res.badRequest();
    //    }
    //    // TODO: ^ pull this into a `isSocketRequest` policy
    //
    //    // Событие сокетов Broadcast для всех остальных в настоящее время в сети, чтобы их пользовательские агенты
    //    // может обновить интерфейс для них.
    //    sails.sockets.broadcast('vacation' + req.param('id'),
    //        'stoppedTyping', {}, (req.isSocket ? req : undefined));
    //
    //    return res.ok();
    //},


}
;

