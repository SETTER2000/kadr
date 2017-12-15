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
    task0: function (options, done) {
        Schedule.find({action: true, worked: false})
            .exec((err, finds) => {
                if (err) return res.serverError(err);
                if (!finds.length)return ;
                console.log('Cron tasks: ', finds.length);
                _.forEach(finds, function (task) {
                    //if (task.jobRunning) return;
                    let job = new CronJob({
                        cronTime: task.start,
                        onTick: function () {
                            console.log('Задача ' + task.name + ' запущена в: ' + moment(task.start).format("LLLL"));
                            User.find({action: true, fired: false}).exec((err, usersFind)=> {
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
                                let options = {
                                    to: strEmail, // Кому: можно несколько получателей указать через запятую
                                    subject: ' ✔ ' + task.name, // Тема письма
                                    text: task.htmlData[0].tmpl, // простой текст письма без форматирования
                                    html: task.htmlData[0].tmpl  // html текст письма
                                };
                                EmailService.sender(options);
                                this.stop();
                            });
                        },
                        onComplete: function () {
                            console.log('Задача выполнена в: ' + new Date());
                            Schedule.update({id: task.id}, {
                                worked: true,
                                status: 'В работе'
                            }).exec((err, upd) => {
                                if (err) return res.serverError();
                                // sails.emit('updateCron');
                                Schedule.find().exec((err, findsSchedule)=> {
                                    if (err) return res.serverError(err);
                                    sails.sockets.broadcast('list', 'hello', {howdy: findsSchedule});
                                    console.log('UPDATE OK! worked:', upd);
                                });
                            });
                        },
                        start: true,
                        timeZone: zone
                    });
                    //job.start();
                    //console.log(job);
                    //sails.log('job status', job.running);
                    if (job.running) console.log('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
                    //if (job.running) {
                    //    Schedule.update({id: task.id}, {
                    //        jobRunning: true
                    //    }).exec((err, upd) => {
                    //        if (err) return res.serverError();
                    //        sails.log('Задача ' + task.name + ' установлена:', upd);
                    //        //sails.sockets.broadcast('list', 'badges', {badges: upd});
                    //    });
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