/**
 * Department.js
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
            defaultsTo: 'Отдел'
        },
        sections: {
            type: 'string',
            defaultsTo: 'Отделы'
        },
        action: {
            type: 'boolean',
            defaultsTo: true,
            required: true
            
        },
        name: {
            type: 'string',
            unique: true,
            minLength: 2,
            maxLength: 150
        },
        type: {
            type: 'string',
            defaultsTo: ''
        },
        location: {
            type: 'string',
            defaultsTo: ''
        },
        lastLoggedIn: {
            type: 'date', required: true, defaultsTo: new Date(0)
        },
        children:{
          type:'array'
        },
        parent:{
          type:'string'

        },
        childrenObj:{
            type:'array'
        },
        ancestors:{
            type:'array'
        },
        //subdivision:{
        //    collection:'department',
        //    via: 'owner',
        //    dominant:true
        //},
        //owner: {
        //    collection: 'department',
        //    via: 'subdivision'
        //},

        // Добавить ссылку на пользователя
        users: {
            collection: 'user',
            via: 'departments'
        },
        emergences: {
            collection: 'emergence',
            via: 'departments'
        }

    }
};

