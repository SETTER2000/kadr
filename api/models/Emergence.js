/**
 * Schedule.js
 *
 * @description :: TODO: график отпусков
 */

module.exports = {
    connection: 'userMongodbServer',
    schema: true,
    attributes: {
        section: {
            type: 'string',
            defaultsTo: 'Выход нового сотрудника',
            required: true
        },
        sections: {
            type: 'string',
            defaultsTo: 'Выход новых сотрудников',
            required: true
        },
        action: {
            type: 'boolean',
            defaultsTo: true,
            required: true
        },
        lastName: {
            type: 'string'
        },
        firstName: {
            type: 'string'
        },
        patronymicName: {
            type: 'string'
        },
        name: {
            type: 'string'
        },

        position: {
            type: 'string'
        },

        boss: {
            type: 'string'
        },
        phone: {
            type: 'boolean',
            defaultsTo: false,
        },
        mobile: {
            type: 'boolean',
            defaultsTo: false,
        },
        bussinescard: {
            type: 'boolean',
            defaultsTo: false,
        },
        //from: {
        //    type: 'date',
        //    defaultsTo: null
        //},
        //to: {
        //    type: 'date',
        //    defaultsTo: null
        //},
        //defaultRows: {
        //    type: 'integer',
        //    defaultsTo: 10
        //},
        //period: {
        //    type: 'string'
        //},
        //Одобрено 	    (APPROVE)   approved
        //Отказано 	    (REJECT)    denied
        //Подтверждено 	(CONFIRM)   confirmed
        //Перенесён 	(TRANSFER)  moved
        //Ожидание 	    (wait_one)  pending
        status: {
            type: 'string',
            defaultsTo: 'Проект',
            enum: ['Проект', 'В работе', 'Утвержден']
        },
        htmlData: {
            type: 'array',
            defaultsTo: []
        },
        htmlData2: {
            type: 'array',
            defaultsTo: []
        },

        //year: {
        //    type: 'integer',
        //    maxLength: 4,
        //    minLength: 4,
        //    required: true,
        //    unique:true
        //},
        start: { //запустить проект расслыки
            type: 'datetime',
            defaultsTo: null
        },
        daysSelectHoliday: {
            type: 'integer'
        },
        countData: {
            type: 'integer'
        },
        worked: { // отработала или нет
            type: 'boolean',
            defaultsTo: true,
            required: true
        },
        jobRunning: { //задача установлена, по умолчанию нет
            type: 'boolean',
            defaultsTo: false,
            required: true
        },
        job: {
            type: 'string'
        },

        //
        ///**
        // *
        // */
        ////intersec:{
        ////    collection: 'vacation'
        ////},
        ///**
        // *  Пересекается с какими отпусками
        // */
        //intersec:{
        //    collection: 'vacation',
        //    via: 'intersecOwner'
        //},
        //intersecOwner: {
        //    collection: 'vacation',
        //    via: 'intersec'
        //},
        whomCreated: {
            model: 'user'
        },
        whomUpdated: {
            model: 'user'
        },

        //vacations: {
        //    collection: 'vacation',
        //    via: 'year'
        //},
        ///**
        // * Чат
        // */
        ////tutorialAssoc: {
        ////    model: 'tutorial'
        ////},
        //chats: {
        //    collection: 'chat',
        //    via: 'vacation'
        //},
        getHoliday: function (id) {
            User.findOne({id: id})
                .populate('positions')
                .exec(function foundUser(err, user) {
                    if (err) return res.serverError(err);
                    if (!user) return res.notFound();
                    res.ok(user);
                });
        },
        getFullName: function () {
            return (!this.name) ? this.name = 'График отпусков на ' : this.name;

        },
        getEditUrl: function () {
            return 'schedules/edit/' + this._id;
        }

    }
};

