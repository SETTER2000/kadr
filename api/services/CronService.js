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
                if (err) return res.serverError(err);
                if (!finds.length) return;
                console.log('Cron tasks0: ', finds.length);
                _.forEach(finds, function (task) {
                    if (moment().isBetween(task.start, moment(task.start).add(afterMin, 'minutes'))) {
                        User.find({action: true, fired: false}).exec((err, usersFind) => {
                            "use strict";
                            if (err) return res.serverError(err);
                            if (!usersFind) return res.notFound('Schedule. Пользователи для получения рассылки не найдены.');
                            let strEmail = '';
                            if (_.isArray(usersFind) && (usersFind.length > 0)) {
                                let a = [];
                                _.forEach(usersFind, function (val, key) {
                                    a.push(val.email);
                                });
                                strEmail = a.join(',');
                            }
                            sails.log('Schedule. Email для рассылки: ', strEmail);
                            strEmail = (strEmail) ? strEmail : '';
                            let options = {
                                to: strEmail, // Кому: можно несколько получателей указать через запятую
                                subject: ' ✔ ' + task.name, // Тема письма
                                text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                                html: task.htmlData[0].tmpl  // html текст письма
                            };
                            EmailService.sender(options, function (err) {
                                if (err) return;
                                console.log('Schedule. Задача выполнена в: ' + new Date());
                                Schedule.update({id: task.id}, {
                                    worked: true,
                                    status: 'В работе'
                                }).exec((err, upd) => {
                                    if (err) return res.serverError();
                                    Schedule.find().exec((err, findsSchedule) => {
                                        if (err) return res.serverError(err);
                                        sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule});
                                        sails.sockets.broadcast('schedule', 'badges', {badges: upd, action: 'рассылка закончена'});
                                        console.log('UPDATE OK!');
                                    });
                                });
                            });
                        });
                    } else {
                        if (moment().isAfter(moment(task.start).add(afterMin, 'minutes'))) {
                            Schedule.update({id: task.id}, {
                                worked: true
                            }).exec((err, upd) => {
                                if (err) return res.serverError();
                                Schedule.find().exec((err, findsSchedule) => {
                                    if (err) return res.serverError(err);
                                    sails.sockets.broadcast('schedule', 'hello', {howdy: findsSchedule});
                                    sails.sockets.broadcast('schedule', 'badges', {badges: upd, action: 'повреждён'});
                                    return console.log('UPDATE OK+!');
                                });
                            });
                        } else {
                            console.log('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
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

        Emergence.find({action: true, worked: false})
            .exec((err, finds) => {
                if (err) return res.serverError(err);
                if (!finds.length) return;
                console.log('Cron tasks1: ', finds.length);
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

                        sails.log(taskName+' Emergence. Email для рассылки: ', strEmail);
                        strEmail = (strEmail) ? strEmail : '';
                        if (!task.htmlData.length) return sails.log('Emergence. Cron Service:', ' Ошибка! Задача '+taskName+' не отработала. Нет текста для рассылки писем.');
                        let options = {
                            to: strEmail, // Кому: можно несколько получателей указать через запятую
                            subject: ' ✔ ' + task.name, // Тема письма
                            text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                            html: task.htmlData[0].tmpl  // html текст письма
                        };
                        EmailService.sender(options, function (err) {
                            if (err) return;
                            console.log(taskName+' Emergence. Задача выполнена в: ' + new Date());
                            Emergence.update({id: task.id}, {
                                worked: true,
                                status: 'В работе',
                                logSender: task.recipient
                            }).exec((err, upd) => {
                                if (err) return res.serverError();
                                Emergence.find({sort:'start DESC'})
                                    .populate('positions')
                                    .populate('departments')
                                    .populate('whomCreated')
                                    .populate('whomUpdated')
                                    .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                    .exec((err, findsEmergence) => {
                                    if (err) return res.serverError(err);
                                    sails.sockets.broadcast('emergence', 'hello-emergence', {howdy: findsEmergence});
                                    sails.sockets.broadcast('emergence', 'badges-emergence', {badges: upd, action: 'на проверке'});
                                    console.log(taskName+' UPDATE OK!');
                                });
                            });
                        });

                    } else {
                        if (moment().isAfter(moment(task.start).add(afterMin, 'minutes'))) {
                            Emergence.update({id: task.id}, {
                                worked: true
                            }).exec((err, upd) => {
                                if (err) return res.serverError();
                                Emergence.find()
                                    .populate('positions')
                                    .populate('departments')
                                    .populate('whomCreated')
                                    .populate('whomUpdated')
                                    .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                    .exec((err, findsSchedule) => {
                                    if (err) return res.serverError(err);
                                    sails.sockets.broadcast('emergence', 'hello-emergence', {howdy: findsSchedule});
                                    sails.sockets.broadcast('emergence', 'badges-emergence', {badges: upd, action: 'повреждён'});
                                    return console.log(taskName+' UPDATE OK+!');
                                });
                            });
                        } else {
                            console.log('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
                        }
                    }
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

        Emergence.find({action: true, worked: true,sendService:false, startKadr: true})
            .exec((err, finds) => {
                if (err) return res.serverError(err);
                if (!finds.length) return;
                console.log('Cron '+taskName+': ', finds.length);
                let start = moment().add(2,'minutes');
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

                        sails.log(taskName+' Emergence. Email для рассылки службам: ', strEmail);
                        strEmail = (strEmail) ? strEmail : '';
                        if (!task.htmlData.length) return sails.log('Emergence. Cron Service:', ' Ошибка! Задача '+taskName+' не отработала. Нет текста для рассылки писем.');
                        let options = {
                            to: strEmail, // Кому: можно несколько получателей указать через запятую
                            subject: ' ✔ ' + task.name, // Тема письма
                            text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                            html: task.htmlData[0].tmpl  // html текст письма
                        };
                        EmailService.sender(options, function (err) {
                            if (err) return;
                            console.log(taskName+' Emergence. Задача выполнена в: ' + new Date());
                            Emergence.update({id: task.id}, {
                                sendService: true,
                                status: 'В работе',
                                recipientService: recipientService
                            }).exec((err, upd) => {
                                if (err) return res.serverError();
                                Emergence.find({sort:'start DESC'})
                                    .populate('positions')
                                    .populate('departments')
                                    .populate('whomCreated')
                                    .populate('whomUpdated')
                                    .populate('ahoUpdate').populate('finUpdate').populate('itUpdate')
                                    .exec((err, findsEmergence) => {
                                        if (err) return res.serverError(err);
                                        sails.sockets.broadcast('emergence', 'hello-emergence', {howdy: findsEmergence});
                                        sails.sockets.broadcast('emergence', 'badges-emergence', {badges: upd, action: 'на проверке'});
                                        console.log(taskName+' UPDATE OK!');
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
                    //                return console.log('UPDATE OK+!');
                    //            });
                    //        });
                    //    } else {
                    //        console.log('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(start));
                    //    }
                    //}
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
    //                 console.log('Задача: ' + options.name);
    //                 console.log('Задача запущена в: ' + tsk.format("LLLL"));
    //                 console.log('Время для Cron: ' + task);
    //                 this.stop();
    //             },
    //             onComplete: function () {
    //                 console.log('Задача выполнена в: ' + new Date());
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