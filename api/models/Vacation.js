/**
 * Vacation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  connection: 'userMongodbServer',
  attributes: {
    section: {
      type: 'string',
      defaultsTo: 'Отпуск',
      required: true
    },
    sections: {
      type: 'string',
      defaultsTo: 'Отпуска',
      required: true
    },
    action: {
      type: 'boolean',
      defaultsTo: true,
      required: true
    },
    from:{
      type:'date',
      defaultsTo:null
    },
    to:{
      type:'date',
      defaultsTo:null
    },
    //whomUpdated:{
    //  type:'string'
    //},
    //whomCreated:{
    //  type:'string'
    //},
    daysSelectHoliday:{
      type:'integer'
    },
    furlough: {
      model: 'furlough'
    },
    owner: {
      model: 'user'
    },
    whomCreated: {
      model: 'user'
    },
    whomUpdated: {
      model: 'user'
    }
  }
};

