/**
 * Created by apetrov on 25.10.2017.
 */

'use strict';
const CronJob = require('cron').CronJob;
const zone = "Europe/Moscow";
var Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
moment.locale('ru');
module.exports = {
    task: function (options, done) {
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
                    return done(null,job);
                },
                start: false,
                timeZone: zone
            });
            job.start();
            sails.log('job status', job.running);
        } catch (err) {
            return done(err);
        }
    }
};