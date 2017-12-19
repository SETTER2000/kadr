module.exports.cron = {
    /**
     * [секунды, минуты, часы,  число месяца, месяц, день недели],
     * ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
     */

    //
    //firstJob: {
    //    schedule: '* * * * * *',
    //    //schedule: '0 03 17 8 12 *',
    //    //schedule: '* 58 11 11 12 *',
    //
    //    onTick: function () {
    //        //console.log('Задача должна быть запущена в: '+this.schedule);
    //        this.stop();
    //    },
    //
    //    onComplete: function () {
    //        //console.log('Задача выполнена в ' + new Date());
    //    },
    //    start: true,
    //    timezone: 'Europe/Moscow'
    //},

    secondJob: {
        schedule: '*/59 * * * * *',
        onTick: function() {
            //console.log('Я срабатываю каждые 5 секунд (триггер): ' + new Date());

            CronService.task0({});
        }
    }


};
//// sails.config.cron.myFirstJob