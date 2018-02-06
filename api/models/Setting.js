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
            defaultsTo: 'Настройка',
            required: true
        },
        sections: {
            type: 'string',
            defaultsTo: 'Настройки',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        checkSender: {
            type: 'boolean',
            defaultsTo: true,
            required: true
        },


    }
};

