/**
 * Created by apetrov on 25.10.2017.
 */

'use strict';
const CronJob = require('cron').CronJob;
const zone = "Europe/Moscow";
var Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const _ = require('lodash');
require('moment-precise-range-plugin');
moment.locale('ru');
module.exports = {
    // Уведомление о начале сбора отпусков
    task0: function (options, done) {
        /**
         *  Добавить 5 минут после запуска
         *  это промежуток в котором сможет запуститься проект в случаи отключения сервера
         *  и вновь поднятия его в период между установленным запуском проекта и плюс одной минутой.
         *  В противном случаи если запуск сервера произойдет позже этого времени, то проект
         *  не будет запущен.
         * @type {number}
         */
        let afterMin = 5;

        Schedule.find({action: true, worked: false})
            .exec((err, finds) => {
                if (err) return console.log('Ошибка при поиске расписания: ', err);
                //if (err) return res.serverError(err);
                if (!finds.length) return;
                sails.log.info('Cron tasks0: ', finds.length);
                _.forEach(finds, function (task) {
                    if (moment().isBetween(task.start, moment(task.start).add(afterMin, 'minutes'))) {
                        User.find({action: true, fired: false}).exec((err, usersFind) => {
                            "use strict";
                            //if (err) return res.serverError(err);
                            if (err) return console.log('Ошибка 2 при поиске расписания: ', err);
                            if (!usersFind) return res.notFound('Schedule. Пользователи для получения рассылки не найдены.');
                            let strEmail = '';
                            if (_.isArray(usersFind) && (usersFind.length > 0)) {
                                let a = [];
                                _.forEach(usersFind, function (val, key) {
                                    a.push(val.email);
                                });
                                strEmail = a.join(',');
                            }
                            sails.log.info('Schedule. Email для рассылки: ', strEmail);
                            strEmail = (strEmail) ? strEmail : '';
                            let options = {
                                to: strEmail, // Кому: можно несколько получателей указать через запятую
                                subject: ' ✔ ' + task.name, // Тема письма
                                text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                                html: task.htmlData[0].tmpl  // html текст письма
                            };
                            EmailService.sender(options, function (err) {
                                if (err) return;
                                sails.log.info('Schedule. Задача выполнена в: ' + new Date());
                                Schedule.update({id: task.id}, {
                                    worked: true,
                                    status: 'В работе'
                                }).exec((err, upd) => {
                                    //if (err) return res.serverError();
                                    if (err) return console.log('Ошибка 3 при поиске расписания: ', err);
                                    Schedule.find().exec((err, findsSchedule) => {
                                        //if (err) return res.serverError(err);
                                        if (err) return console.log('Ошибка 4 при поиске расписания: ', err);
                                        sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule});
                                        sails.sockets.broadcast('schedule', 'badges', {badges: upd, action: 'рассылка закончена'});
                                        sails.log.info('UPDATE OK!');
                                    });
                                });
                            });
                        });
                    } else {
                        if (moment().isAfter(moment(task.start).add(afterMin, 'minutes'))) {
                            Schedule.update({id: task.id}, {
                                worked: true
                            }).exec((err, upd) => {
                                //if (err) return res.serverError();
                                if (err) return console.log('Ошибка 5 при поиске расписания: ', err);
                                Schedule.find().exec((err, findsSchedule) => {
                                    //if (err) return res.serverError(err);
                                    if (err) return console.log('Ошибка 6 при поиске расписания: ', err);
                                    sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule});
                                    sails.sockets.broadcast('schedule', 'badges', {badges: upd, action: 'повреждён'});
                                    return sails.log.info('UPDATE OK+0!');
                                });
                            });
                        } else {
                            sails.log.info('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
                        }
                    }
                });
            });
    },

    // Уведомление о выходе нового сотрудника для кадров
    task1: function (options, done) {
        let taskName = 'TASK 1';
        /**
         *  Добавить 5 минут после запуска
         *  это промежуток в котором сможет запуститься проект в случаи отключения сервера
         *  и вновь поднятия его в период между установленным запуском проекта и плюс одной минутой.
         *  В противном случаи если запуск сервера произойдет позже этого времени, то проект
         *  не будет запущен.
         * @type {number}
         */
        let afterMin = 5;
        Setting.find({checkSender: true})
            .exec((err, settingFinds)=> {
                //if (err) return res.serverError(err);
                if (err) return console.log('Ошибка при поиске настроек: ', err);
                if (!settingFinds.length) return;
                //if (!settingFinds.length) return sails.log('Внимание! Отключена рассылка в настройках модуля "Emergence".');
                Emergence.find({action: true, worked: false})
                    .exec((err, finds) => {
                        //if (err) return res.serverError(err);
                        if (err) return console.log('Ошибка при поиске в Emergence: ', err);
                        if (!finds.length) return;
                        sails.log.info('Cron tasks1: ', finds.length);
                        _.forEach(finds, function (task) {
                            if (moment().isBetween(task.start, moment(task.start).add(afterMin, 'minutes'))) {
                                let strEmail = '';
                                if (_.isArray(task.recipient) && (task.recipient.length > 0)) {
                                    let a = [];
                                    _.forEach(task.recipient, function (val, key) {
                                        a.push(val.email);
                                    });
                                    strEmail = a.join(',');
                                }

                                sails.log(taskName + ' Emergence. Email для рассылки: ', strEmail);
                                strEmail = (strEmail) ? strEmail : '';
                                if (!task.htmlData.length) return sails.log('Emergence. Cron Service:', ' Ошибка! Задача ' + taskName + ' не отработала. Нет текста для рассылки писем.');
                                let options = {
                                    to: strEmail, // Кому: можно несколько получателей указать через запятую
                                    subject: ' ✔ ' + task.name, // Тема письма
                                    text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                                    html: task.htmlData[0].tmpl  // html текст письма
                                };
                                EmailService.sender(options, function (err) {
                                    if (err) return;
                                    sails.log.info(taskName + ' Emergence. Задача выполнена в: ' + new Date());
                                    Emergence.update({id: task.id}, {
                                        worked: true,
                                        status: 'В работе',
                                        logSender: task.recipient
                                    }).exec((err, upd) => {
                                        //if (err) return res.serverError();
                                        if (err) return console.log('Ошибка 2 при поиске в Emergence: ', err);
                                        Emergence.find({sort: 'start DESC'})
                                            .populate('positions')
                                            .populate('departments')
                                            .populate('whomCreated')
                                            .populate('whomUpdated')
                                            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                            .exec((err, findsEmergence) => {
                                                //if (err) return res.serverError(err);
                                                if (err) return console.log('Ошибка 3 при поиске в Emergence: ', err);
                                                sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: findsEmergence});
                                                sails.sockets.broadcast('emergence', 'hello-emergence-edit', {howdy: upd});
                                                sails.sockets.broadcast('emergence', 'badges-emergence', {
                                                    badges: upd,
                                                    action: 'на проверке',
                                                    avatarUrl: '/images/logo_old.png',
                                                    shortName: 'server',
                                                    fullName: 'server'
                                                });
                                                sails.log.info(taskName + ' UPDATE OK+1.0!');
                                            });
                                    });
                                });

                            } else {
                                if (moment().isAfter(moment(task.start).add(afterMin, 'minutes'))) {
                                    Emergence.update({id: task.id}, {
                                        worked: true
                                    }).exec((err, upd) => {
                                        //if (err) return res.serverError();
                                        if (err) return console.log('Ошибка при обновлении в Emergence: ', err);
                                        Emergence.find()
                                            .populate('positions')
                                            .populate('departments')
                                            .populate('whomCreated')
                                            .populate('whomUpdated')
                                            .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                            .exec((err, findsSchedule) => {
                                                //if (err) return res.serverError(err);
                                                if (err) return console.log('Ошибка 4 при поиске в Emergence: ', err);
                                                sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: findsSchedule});
                                                sails.sockets.broadcast('emergence', 'hello-emergence-edit', {howdy: upd});
                                                sails.sockets.broadcast('emergence', 'badges-emergence', {
                                                    badges: upd,
                                                    action: 'на проверке',
                                                    avatarUrl: '/images/logo_old.png',
                                                    shortName: 'server',
                                                    fullName: 'server'
                                                });
                                                return sails.log.info(taskName + ' UPDATE OK+1.1!');
                                            });
                                    });
                                } else {
                                    sails.log.info('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
                                }
                            }
                        });
                    });
            });

    },


    // Уведомление о выходе нового сотрудника для служб
    task2: function (options, done) {
        let taskName = 'TASK 2';

        /**
         *  Добавить 5 минут после запуска
         *  это промежуток в котором сможет запуститься проект в случаи отключения сервера
         *  и вновь поднятия его в период между установленным запуском проекта и плюс одной минутой.
         *  В противном случаи если запуск сервера произойдет позже этого времени, то проект
         *  не будет запущен.
         * @type {number}
         */
        let afterMin = 5;
        Setting.find({checkSender: true})
            .exec((err, settingFinds)=> {
                //if (err) return res.serverError(err);
                if (err) return console.log('Ошибка при поиске в Setting: ', err);
                if (!settingFinds.length) return;
                //if (!settingFinds.length) return sails.log('Внимание! Отключена рассылка в настройках модуля "Emergence".');

                Emergence.find({action: true, worked: true, sendService: false, startKadr: true})
                    .exec((err, finds) => {
                        //if (err) return res.serverError(err);
                        if (err) return console.log('Ошибка 5 при поиске в Emergence: ', err);

                        if (!finds.length) return;
                        sails.log.info('Cron ' + taskName + ' ' + finds[0].section + ': ', finds.length);
                        let start = moment().add(2, 'minutes');
                        let recipientService = sails.config.recipient.services;
                        _.forEach(finds, function (task) {
                            //if (moment().isBetween(start, moment(start).add(afterMin, 'minutes'))) {

                            let strEmail = '';
                            if (_.isArray(task.recipientService) && (recipientService.length > 0)) {
                                let a = [];
                                _.forEach(recipientService, function (val, key) {
                                    a.push(val.email);
                                });
                                strEmail = a.join(',');
                            }

                            sails.log.info(taskName + ' Emergence. Email для рассылки службам: ', strEmail);
                            strEmail = (strEmail) ? strEmail : '';
                            if (!task.htmlData.length) return sails.log.info('Emergence. Cron Service:', ' Ошибка! Задача ' + taskName + ' не отработала. Нет текста для рассылки писем.');
                            let options = {
                                to: strEmail, // Кому: можно несколько получателей указать через запятую
                                subject: ' ✔ ' + task.name, // Тема письма
                                text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                                html: task.htmlData[0].tmpl  // html текст письма
                            };
                            EmailService.sender(options, function (err) {
                                if (err) return;
                                sails.log.info(taskName + ' Emergence. Задача выполнена в: ' + new Date());
                                Emergence.update({id: task.id}, {
                                    sendService: true,
                                    status: 'В работе',
                                    recipientService: recipientService
                                }).exec((err, upd) => {
                                    //if (err) return res.serverError();
                                    if (err) return console.log('Ошибка при update в Emergence: ', err);
                                    Emergence.find({sort: 'start DESC'})
                                        .populate('positions')
                                        .populate('departments')
                                        .populate('whomCreated')
                                        .populate('whomUpdated')
                                        .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                        .exec((err, findsEmergence) => {
                                            //if (err) return res.serverError(err);
                                            if (err) return console.log('Ошибка при find в Emergence: ', err);
                                            sails.sockets.broadcast('emergence', 'hello-emergence-list', {howdy: findsEmergence});
                                            sails.sockets.broadcast('emergence', 'hello-emergence-edit', {howdy: upd});
                                            sails.sockets.broadcast('emergence', 'badges-emergence', {
                                                badges: upd,
                                                action: 'проверено',
                                                avatarUrl: '/images/logo_old.png',
                                                shortName: 'server',
                                                fullName: 'server'
                                            });
                                            sails.log.info(taskName + ' UPDATE OK+2!');
                                        });
                                });
                            });

                            //} else {
                            //    if (moment().isAfter(moment(start).add(afterMin, 'minutes'))) {
                            //        Emergence.update({id: task.id}, {
                            //            sendService: true
                            //        }).exec((err, upd) => {
                            //            if (err) return res.serverError();
                            //            Emergence.find().exec((err, findsSchedule) => {
                            //                if (err) return res.serverError(err);
                            //                sails.sockets.broadcast('emergence', 'hello', {howdy: findsSchedule});
                            //                sails.sockets.broadcast('emergence', 'badges', {badges: upd, action: 'повреждён'});
                            //                return sails.log.info('UPDATE OK+!');
                            //            });
                            //        });
                            //    } else {
                            //        sails.log.info('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(start));
                            //    }
                            //}
                        });
                    });
            });
    },


    // task1: function (options, done) {
    //     let tsk = moment(options.start);
    //     let task = '* ' + tsk.get('minute') + ' ' + tsk.get('hour') + ' ' + tsk.date() + ' ' + (tsk.format('M')) + ' *';
    //     try {
    //         let job = new CronJob({
    //             cronTime: task,
    //             onTick: function () {
    //                 sails.log.info('Задача: ' + options.name);
    //                 sails.log.info('Задача запущена в: ' + tsk.format("LLLL"));
    //                 sails.log.info('Время для Cron: ' + task);
    //                 this.stop();
    //             },
    //             onComplete: function () {
    //                 sails.log.info('Задача выполнена в: ' + new Date());
    //                 return done(null, job);
    //             },
    //             start: true,
    //             timeZone: zone
    //         });
    //         //job.start();
    //         sails.log('job status', job.running);
    //     } catch (err) {
    //         return done(err);
    //     }
    // }
};