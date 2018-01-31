/**
 * EmergenceController
 * Выход нового сотрудника
 * @description :: TODO: выход нового сотрудника
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
        //console.log('GET ALL PARAMS Emergence:', req.params.all());
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
            Emergence.findOne(req.param('id'))
                .populate('positions')
                .populate('departments')
                .populate('whomCreated')
                .populate('whomUpdated')
                .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
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
                    //User.find(q)
                    //    .populate('interfaces')
                    //    .exec(function foundUser(err, users) {
                    //        if (err) return res.serverError(err);
                    //        if (!users) return res.notFound();

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

                    Emergence.find(q)
                        .populate('positions')
                        .populate('departments')
                        .populate('whomCreated')
                        .populate('whomUpdated')
                        .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                        .exec(function foundEmergence(err, emergences) {
                            if (err) return res.serverError(err);
                            if (!emergences) return res.notFound();
                            async.each(emergences, function (file, callback) {
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
                            res.send(emergences);
                        });
                });
            //});
        }
    },

    /**
     * Создать
     * @param req
     * @param res
     * @returns {*}
     */
    create: function (req, res) {

        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //console.log('ALL CREATE RWEQ:', req.params.all());
        let fullName = req.param('lastName') + ' ' + req.param('firstName') + ' ' + req.param('patronymicName');
        if (!req.param('departments')) return res.badRequest('Не указан департамент.');
        let start = moment(req.param('start')).format('YYYY-MM-DDTHH:mmZ');
        Department.findOne(req.param('departments')[0]).exec((err, findDepart)=> {
            "use strict";
            if (err) return res.serverError(err);
            let recipient = sails.config.recipient.kadr;
            let tmp = [{
                description: 'Уведомление о выходе нового сотрудника',
                outputEmployee: '',
                name: '№1',
                tmpl: '<h1>Уважаемые, коллеги!</h1>' +
                '<p> Планируется выход нового сотрудника - ' + fullName + '  в ' + findDepart.name + ' на должность ' + req.param('post') + '. </p>' +
                '<p>Предполагаемая дата выхода - ' + moment(new Date(req.param('outputEmployee')), ['DD.MM.YYYY']).format('DD.MM.YYYY') + '. </p>' +
                '<p>Ссылка на заявку -  <a href="' + sails.config.appUrl.http + '/company/emergences">' + fullName + '</a></p>'
            }];
            tmp = (req.param('htmlData')) ? req.param('htmlData') : tmp;
            if (moment().isSameOrAfter(req.param('start'))) return res.badRequest('ВНИМАНИЕ! Дата просрочена.');
            let obj = {
                section: 'Выход нового сотрудника',
                sections: 'Выход новых сотрудников',
                name: req.param('name'),
                post: req.param('post'),
                room: req.param('room'),
                startKadr: false,
                sendService: false,
                remote: req.param('remote'),
                dax: req.param('dax'),
                recipient: recipient,
                extra: req.param('extra'),
                location: req.param('location'),
                whomCreated: req.session.me,
                daysSelectHoliday: req.param('daysSelectHoliday'),
                action: req.param('action'),
                positions: req.param('positions'),
                departments: req.param('departments'),
                status: 'Новая',
                start: new Date(start),
                outputEmployee: new Date(req.param('outputEmployee')),
                //countData: +req.param('countData'),
                lastName: req.param('lastName'),
                firstName: req.param('firstName'),
                patronymicName: req.param('patronymicName'),
                boss: req.param('boss'),
                bussinescard: req.param('bussinescard'),
                phone: req.param('phone'),
                //phoneNumber: req.param('phoneNumber'),
                //email: req.param('email'),
                mobile: req.param('mobile'),
                htmlData: tmp,
                htmlData2: req.param('htmlData2'),
                idleStart: '',
                worked: moment().isSameOrAfter(moment(new Date(req.param('start')), ['X'])),
                //from: new Date(req.param('from')),
                //to: new Date(req.param('to'))
            };
            //console.log('Object CREATE Emergence:', obj);
            User.findOne({id: obj.whomCreated})
                .exec((err, findUser) => {
                    Emergence.create(obj)
                        .exec(function (err, createEmergence) {
                            if (err) return res.serverError(err);
                            console.log(obj.section + ' создан пользователем:', findUser.getFullName());
                            findUser.emergenceWhomCreated.add(createEmergence.id);
                            findUser.save(function (err) {
                                if (err) {
                                    return res.serverError(err);
                                }

                                // Подготовка ответа серверу после создания
                                Emergence.findOne({id: createEmergence.id})
                                    .populate('positions')
                                    .populate('departments')
                                    .populate('whomCreated')
                                    .populate('whomUpdated')
                                    .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                    .exec(function foundVacation(err, findOneEmerg) {
                                        if (err) return res.serverError(err);
                                        // Обновляем сокеты
                                        Emergence.find({sort: 'start DESC'})
                                            .populate('positions')
                                            .populate('departments')
                                            .populate('whomCreated')
                                            .populate('whomUpdated')
                                            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                            .exec((err, findEmergence) => {
                                                if (err) return res.serverError(err);

                                                // _.forEach(req.param('htmlData'), function (val, key) {
                                                //     findEmergence.htmlData = val;
                                                // });

                                                // findEmergence.save(function (err) {
                                                //     if (err) {
                                                //         return res.serverError(err);
                                                //     }

                                                sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: findEmergence}, req);
                                                sails.sockets.broadcast('emergence', 'badges-emergence', {
                                                    badges: [createEmergence],
                                                    action: 'создан',
                                                    shortName: findUser.getShortName(),
                                                    fullName: findUser.getFullName(),
                                                    avatarUrl: findUser.avatarUrl
                                                }, req);
                                                res.send(findOneEmerg);
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
        let action = (req.param('kadrValid')) ? false : true;
        let fullName = req.param('lastName') + ' ' + req.param('firstName') + ' ' + req.param('patronymicName');
        if (!req.param('departments')) return res.badRequest('Не указан департамент.');
        //console.log('ALL REQUEST: ', req.params.all());
        //console.log('REQUEST PARAM itUpdate: ', req.param('itUpdate'));
        Department.findOne({id: req.param('departments')[0].id})
            .exec((err, findDepart)=> {
                "use strict";
                if (err) return res.serverError(err);
                let tmp = [{
                    description: 'Уведомление о выходе нового сотрудника',
                    outputEmployee: '',
                    name: '№1',
                    tmpl: '<h1>Уважаемые, коллеги!</h1>' +
                    '<p> Планируется выход нового сотрудника - ' + fullName + '  в ' + findDepart.name + ' на должность ' + req.param('post') + '. </p>' +
                    '<p>Предполагаемая дата выхода - ' + moment(new Date(req.param('outputEmployee')), ['DD.MM.YYYY']).format('DD.MM.YYYY') + '. </p>' +
                    '<p>Ссылка на заявку -  <a href="' + sails.config.appUrl.http + '/company/emergences/edit/' + req.param('id') + '">' + fullName + '</a></p>'
                }];
                let obj = {
                    section: 'Выход нового сотрудника',
                    sections: 'Выход новых сотрудников',
                    name: req.param('name'),
                    post: req.param('post'),
                    room: req.param('room'),
                    dax: req.param('dax'),
                    lastName: req.param('lastName'),
                    firstName: req.param('firstName'),
                    patronymicName: req.param('patronymicName'),
                    startKadr: req.param('startKadr'),
                    kadrValid: req.param('kadrValid'),
                    endKadr: req.param('endKadr'),
                    finCheck: req.param('finCheck'),
                    ahoCheck: req.param('ahoCheck'),
                    itCheck: req.param('itCheck'),
                    hdCheck: req.param('hdCheck'),
                    commentKadr: req.param('commentKadr'),
                    recipient: req.param('recipient'),
                    remote: req.param('remote'),
                    boss: req.param('boss'),
                    extra: req.param('extra'),
                    location: req.param('location'),
                    ahoUpdate: req.param('ahoUpdate'),
                    itUpdate: req.param('itUpdate'),
                    finUpdate: req.param('finUpdate'),
                    whomUpdated: req.session.me,
                    daysSelectHoliday: req.param('daysSelectHoliday'),
                    action: action,
                    status: (req.param('kadrValid')) ? 'Отклонена' : ((req.param('status') === 'Завершена') ? req.param('status') : (moment().isSameOrAfter(moment(new Date(req.param('start')), ['X']))) ? 'В работе' : 'Новая'),
                    htmlData: tmp,
                    bussinescard: req.param('bussinescard'),
                    phone: req.param('phone'),
                    mobile: req.param('mobile'),
                    outputEmployee: new Date(req.param('outputEmployee')),
                    phoneNumber: req.param('phoneNumber'),
                    email: req.param('email'),
                    departments: req.param('departments'),
                    positions: req.param('positions'),
                    worked: moment().isSameOrAfter(moment(new Date(req.param('start')), ['X']))
                };
                User.findOne({id: obj.whomUpdated})
                    .exec((err, findUser) => {
                        "use strict";
                        if (err) return res.serverError(err);
                        if (!findUser) return res.notFound();
                        Emergence.update(req.param('id'), obj)
                            .populate('whomCreated')
                            .populate('whomUpdated')
                            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                            .populate('positions')
                            .populate('departments')
                            .exec((err, objEdit) => {
                                if (err) return res.negotiate(err);
                                Emergence.findOne(req.param('id'))
                                    .populate('positions')
                                    .populate('departments')
                                    .populate('whomCreated')
                                    .populate('whomUpdated')
                                    .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                    .exec((err, findOneEm) => {
                                        if (req.param('positionRemove')) {
                                            //console.log('PARAM', req.param('positionRemove'));
                                            //findOneEm.positions.remove(req.param('positionRemove'));
                                            //findOneEm.save(function (err) {
                                            //    if (err) return res.negotiate(err);
                                            //    findUser.save(function (err) {
                                            //        if (err) return res.negotiate(err);
                                            //
                                            //        //console.log('UPDATED:', findOneEm.action+' '+ findOneEm.worked+' '+ findOneEm.sendService+' '+ findOneEm.startKadr);
                                            //
                                            //        Emergence.find({sort: 'start DESC'})
                                            //            .populate('positions')
                                            //            .populate('departments')
                                            //            .populate('whomCreated')
                                            //            .populate('whomUpdated')
                                            //            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                            //            .exec((err, findsEmergence) => {
                                            //                if (err) return res.serverError(err);
                                            //                sails.sockets.broadcast('emergence', 'hello-emergence', {howdy: findsEmergence}, req);
                                            //                sails.sockets.broadcast('emergence', 'badges-emergence', {
                                            //                    badges: objEdit,
                                            //                    action: 'удалён',
                                            //                    shortName: findUser.getShortName(),
                                            //                    fullName: findUser.getFullName(),
                                            //                    avatarUrl: findUser.avatarUrl
                                            //                }, req);
                                            //                findOneEm.start = new Date(findOneEm.start);
                                            //                console.log('UPDATE OUT', findOneEm);
                                            //                res.send(findOneEm);
                                            //            });
                                            //    });
                                            //});
                                        } else {
                                            //console.log('UPDATED2:', findOneEm.action+' '+ findOneEm.worked+' '+ findOneEm.sendService+' '+ findOneEm.startKadr);
                                            Emergence.find({sort: 'start DESC'})
                                                .populate('positions')
                                                .populate('departments')
                                                .populate('whomCreated')
                                                .populate('whomUpdated')
                                                .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                                .exec((err, findsEmergence) => {
                                                    if (err) return res.serverError(err);
                                                    sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: findsEmergence}, req);
                                                    sails.sockets.broadcast('emergence', 'badges-emergence', {
                                                        badges: objEdit,
                                                        action: 'обновлён',
                                                        shortName: findUser.getShortName(),
                                                        fullName: findUser.getFullName(),
                                                        avatarUrl: findUser.avatarUrl
                                                    }, req);
                                                    sails.sockets.broadcast('emergence', 'hello-emergence-edit', {howdy: findOneEm}, req);
                                                    res.ok();
                                                });
                                        }
                                    });
                            });
                    });
            });
    },

    /**
     * Возвращает массив logSender, по id
     * @param req
     * @param res
     */
    getLogSender: function (req, res) {
        //console.log('REG all, ', req.params.all());
        Emergence.findOne(req.param('id'))
            .exec((err, findsUser)=> {
                "use strict";
                if (err) res.serverError(err);

                res.ok(findsUser.logSender);
            });
    },
    //
    //
    ///**
    // * Собираем Email сотрудников для рассылки
    // * уведомления о начале сбора отпусков на след. год
    // * только активные учётки и только кто работает в данный момент
    // *
    // * @param req
    // * @param res
    // */
    //ticket: function (req, res) {
    //    User.find({action: true, fired: false}).exec((err, usersFind) => {
    //        "use strict";
    //        if (err) return res.serverError(err);
    //        if (!usersFind) return res.notFound('Пользователи для получения рассылки не найдены.');
    //        let strEmail = '';
    //        if (_.isArray(usersFind) && (usersFind.length > 0)) {
    //            let a = [];
    //            _.forEach(usersFind, function (val, key) {
    //                a.push(val.email);
    //            });
    //            strEmail = a.join(',');
    //        }
    //        //sails.log('Email для рассылки: ', strEmail);
    //
    //        strEmail = (strEmail) ? strEmail : '';
    //        console.log('Создатель графика отпусков:', strEmail);
    //
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
    //        res.send(createEmergence);
    //
    //
    //    });
    //
    //},
    //
    //
    ///**
    // * Удалить
    // * @param req
    // * @param res
    // * @param next
    // */
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me})
            .populate('positions')
            .populate('departments')
            .exec((err, finOneUser) => {
            "use strict";
            if (err) return res.serverError(err);
            Emergence.findOne(req.param('id'))
                .populate('positions')
                .populate('departments')
                .populate('whomCreated')
                .populate('whomUpdated')
                .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                .exec((err, finds) => {
                    "use strict";
                    if (err) return res.serverError(err);
                    if (!finds) return res.notFound();
                    //if (finds.vacations.length > 0) return res.badRequest('График не может быть удалён, существуют зависимости. Сначала удалите все отпуска связаные с '+req.param('year')+' годом. <a class="kadr-link"  target="_blank" href="/vacation/delete-all/'+req.param('year')+'"><i class="fa fa-link" aria-hidden="true"></i> Удалить </a>');
                    Emergence.destroy({id: finds.id}, (err) => {
                        if (err) return next(err);
                        console.log('Выход нового сотрудника - удалил:', req.session.me);
                        finds.updatedAt= new Date();
                        console.log('Выход нового сотрудника - удалён:', finds);
                        Emergence.find()
                            .populate('positions')
                            .populate('departments')
                            .populate('whomCreated')
                            .populate('whomUpdated')
                            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                            .exec((err, findEmergence) => {
                                if (err) return res.serverError(err);
                                sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: false}, req);
                                sails.sockets.broadcast('emergence', 'hello-emergence-edit', {howdy: false}, req);
                                sails.sockets.broadcast('emergence', 'badges-emergence', {
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
    //
    //
    ///**
    // * Обновить 'кол-во строк в таблице' пользователю
    // * @param req
    // * @param res
    // */
    //updateDefaultRows: function (req, res) {
    //    //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //    Emergence.update(req.session.me, {
    //            defaultRows: req.param('defaultRows')
    //        })
    //        .exec(function (err, update) {
    //            if (err) return res.negotiate(err);
    //            return res.ok(update);
    //        });
    //},
    //
    //
    ///**
    // * Возвращает максимальный номер года
    // * на который есть выход нового сотрудника
    // * @param req
    // * @param res
    // */
    //maxYear: function (req, res) {
    //    //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //    Emergence.find({sort: 'year DESC', action: true, limit: 1}).exec((err, findOne)=> {
    //        "use strict";
    //        if (err) res.serverError(err);
    //        res.ok(findOne[0]);
    //
    //    });
    //},
    //
    //
    ///**
    // * Возвращает минимальный номер года
    // * на который есть выход нового сотрудника
    // * @param req
    // * @param res
    // */
    //minYear: function (req, res) {
    //    //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //    Emergence.find({sort: 'year', action: true, limit: 1}).exec((err, findOne)=> {
    //        "use strict";
    //        if (err) res.serverError(err);
    //        res.ok(findOne[0]);
    //    });
    //},
    //
    //
    ///**
    // * Возвращает кол-во запланированных отпусков
    // */
    //getHolidaysToYears: function (req, res) {
    //    Vacation.native(function (err, collection) {
    //        if (err) return res.serverError(err);
    //        let start = new Date(moment(req.param('year'), ['YYYY']).format('YYYY-MM-DD'));
    //        let end = new Date(moment(req.param('year'), ['YYYY']).add(1, 'year').format('YYYY-MM-DD'));
    //        let y = 0;
    //        collection.aggregate([{$match: {$and: [{from: {$gte: start}}, {from: {$lt: end}}, {action: {$eq: true}}]}}, {
    //                $group: {
    //                    _id: "$owner",
    //                    cntDs: {$sum: "$daysSelectHoliday"}
    //                }
    //            }, {$project: {id: 1, summa: {$cond: {if: {$gte: ["$cntDs", 28]}, then: 1, else: 0}}}}])
    //            .toArray(function (err, results) {
    //                if (err) return res.serverError(err);
    //                //return results;
    //                _.forEach(results, function (value, key) {
    //                    console.log('numSelected', value.summa);
    //                    y += value.summa;
    //                });
    //                //console.log('y', y);
    //                return res.send({sumDays: y});
    //            });
    //
    //    });
    //
    //
    //},
    //
    //


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
        sails.sockets.join(req, 'emergence');


        // Передавать уведомление всем сокетам, которые присоединились
        // к комнате «list», за исключением нашего нового добавленного сокета:
        //sails.sockets.broadcast('emergence', 'hello', {howdy: 'hi there!'}, req);


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
            anyData: 'Вы подключились к комнате emergence и слушаете событие hello'
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
        sails.sockets.join(req, 'emergence');


        // Передавать уведомление всем сокетам, которые присоединились
        // к комнате «list», за исключением нашего нового добавленного сокета:
        //sails.sockets.broadcast('emergence', 'hello', {howdy: 'hi there!'}, req);


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
            anyData: 'Вы подключились к комнате emergence и слушаете событие badges'
        });

        /**
         * TODO END SOCKET
         */
    },


    //test: function (req, res) {
    //    //Emergence.find({action: true, worked: false})
    //    //    .exec((err, finds) => {
    //    //        if (err) return res.serverError(err);
    //            User.find({action: true, fired: false, id:[ '58a461e66723246b6c2bc61b', '58a461e66723246b6c2bc634']})
    //                .exec((err, findsUser)=> {
    //                    "use strict";
    //                    if (err) res.serverError(err);
    //
    //                    res.ok(findsUser);
    //                });
    //        //});
    //}
};

