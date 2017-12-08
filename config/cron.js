module.exports.cron = {
    /**
     * [секунды, минуты, часы,  число месяца, месяц, день недели],
     * ['seconds', 'minutes', 'hours', 'dayOfMonth', 'month', 'dayOfWeek']
     */


    myJob: {
        schedule: '* * * * * *',
        //schedule: '0 03 17 8 12 *',
       //schedule: '* 55 17 8 12 *',
        onTick: function () {
            this.schedule = this.first;
            console.log('Задача запущена: ' + this.go );
            console.log('schedule: ' + this.schedule );
           this.stop();
        },
        onComplete: function() {
            console.log('Задача выполнена в '+ new Date());
        },
        start: false,
        timezone: 'Europe/Moscow',
        go:0,
        first:''
    }

    // timezone Brazil example
};
// sails.config.cron.myFirstJob