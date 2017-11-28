/**
 * Interface.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'userMongodbServer',
  attributes: {
    section: {
      type: 'string',
      defaultsTo:'Интерфейс',
      required: true
    },
    sections: {
      type: 'string',
      defaultsTo: 'Интерфейсы',
      required: true
    },
    year:{
      type:'integer'
    },
    users: {
      collection: 'user',
      via: 'interfaces'
    },
    defaultRows:{
      type:'integer'
    }

  }
};

