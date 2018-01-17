/**
 * Position.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'userMongodbServer',
    schema: true,
    attributes: {
        section: {
            type: 'string',
            defaultsTo: 'Должность'
        },
        sections: {
            type: 'string',
            defaultsTo: 'Должности'
        },
        action: {
            type: 'boolean',
            defaultsTo: true,
            required: true
        },
        name: {
            type: 'string',
            unique:true,
            minLength: 2,
            maxLength: 75
        },
        type: {
            type: 'string',
            defaultsTo: ''
        },
        location: {
            type: 'string',
            defaultsTo: ''
        },
        // Добавить ссылку на пользователя
        users: {
            collection: 'user',
            via: 'positions'
        } ,

        // Добавить ссылку на пользователя
        emergences: {
            collection: 'emergence',
            via: 'positions'
        }
    }
};

