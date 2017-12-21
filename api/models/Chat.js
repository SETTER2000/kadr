/**
 * Chat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'userMongodbServer',
    attributes: {
        avatarUrl: {
            type: 'string'
        },
        name: {
            type: 'string',
            maxLength: 900
        },
        message: {
            type: 'string',
            maxLength: 900
        },

        sender: {
            model: 'user'
        },

        vacation: {
            model: 'vacation'
        }
    }
};