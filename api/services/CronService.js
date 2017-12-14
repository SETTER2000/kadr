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
                if (!finds.length) return;
                console.log('Cron tasks: ', finds.length);
                _.forEach(finds, function (task) {
                    console.log('Задача: ' + task.name + '; осталось до запуска: ', moment().preciseDiff(task.start));
                    try {
                        new CronJob({
                            cronTime: task.start,
                            onTick: function () {
                                console.log('Задача: ' + task.name);
                                console.log('Задача запущена в: ' + moment(task.start).format("LLLL"));
                                this.stop();
                            },
                            onComplete: function () {
                                console.log('Задача выполнена в: ' + new Date());
                                Schedule.update({id: finds[0].id}, {
                                    worked: true,
                                    status: 'В работе'
                                }).exec((err, upd) => {
                                    if (err) return res.serverError();
                                    sails.emit('updateCron');
                                    console.log('UPDATE OK! worked:', upd.worked);
                                });
                            },
                            start: true,
                            timeZone: zone
                        });
                        //job.start();
                        //console.log(job);
                        //sails.log('job status', job.running);
                    } catch (err) {
                        return done(err);
                    }
                });
            });
    },
    task1: function (options, done) {
        let tsk = moment(options.start);
        let task = '* ' + tsk.get('minute') + ' ' + tsk.get('hour') + ' ' + tsk.date() + ' ' + (tsk.format('M')) + ' *';
        try {
            let job = new CronJob({
                cronTime: task,
                onTick: function () {
                    console.log('Задача: ' + options.name);
                    console.log('Задача запущена в: ' + tsk.format("LLLL"));
                    console.log('Время для Cron: ' + task);
                    this.stop();
                },
                onComplete: function () {
                    console.log('Задача выполнена в: ' + new Date());
                    return done(null, job);
                },
                start: true,
                timeZone: zone
            });
            //job.start();
            sails.log('job status', job.running);
        } catch (err) {
            return done(err);
        }
    }
};