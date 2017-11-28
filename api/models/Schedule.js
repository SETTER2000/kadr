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
            defaultsTo: 'График отпуска',
            required: true
        },
        sections: {
            type: 'string',
            defaultsTo: 'График отпусков',
            required: true
        },
        action: {
            type: 'boolean',
            defaultsTo: true,
            required: true
        },
        from: {
            type: 'date',
            defaultsTo: null
        },
        to: {
            type: 'date',
            defaultsTo: null
        },

        //Одобрено 	    (APPROVE)   approved
        //Отказано 	    (REJECT)    denied
        //Подтверждено 	(CONFIRM)   confirmed
        //Перенесён 	(TRANSFER)  moved
        //Ожидание 	    (wait_one)  pending
        status: {
            type: 'string',
            defaultsTo: 'pending',
            enum: ['approved', 'denied', 'confirmed', 'moved', 'pending']
        },
        name: {
            type: 'string'
        },
        //whomCreated:{
        //  type:'string'
        //},
        //daysSelectHoliday: {
        //    type: 'integer'
        //},
        //furlough: {
        //    model: 'furlough'
        //},
        //owner: {
        //    model: 'user'
        //},
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
        //whomCreated: {
        //    model: 'user'
        //},
        //whomUpdated: {
        //    model: 'user'
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
        //getHoliday: function (id) {
        //    User.findOne({id: id})
        //        .populate('positions')
        //        .exec(function foundUser(err, user) {
        //            if (err) return res.serverError(err);
        //            if (!user) return res.notFound();
        //            res.ok(user);
        //        });
        //}
    }
};

