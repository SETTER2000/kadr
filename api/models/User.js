/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'userMongodbServer',
    //schema: true,
    attributes: {
        section: {
            type: 'string',
            defaultsTo: 'Сотрудник'
        },
        sections: {
            type: 'string',
            defaultsTo: 'Сотрудники'
        },
        action: {
            type: 'boolean',
            defaultsTo: false
        },
        firstName: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 15
        },

        lastName: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 15
        },
        patronymicName: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 15
        },
        onLine: {
            type: 'boolean',
            defaultsTo: false
        },
        login: {
            type: 'string',
            required: true,
            unique: true
        },

        email: {
            type: 'string',
            email: true,
            unique: true,
            required: true
        },

        deleted: {
            type: 'boolean'
        },

        admin: {
            type: 'boolean'
        },

        kadr: {
            type: 'boolean'
        },

        leader: {
            type: 'boolean'
        },

        birthday: {
            type: 'date',
            defaultsTo: null
        },

        subdivision: {
            type: 'array',
            defaultsTo: '[]'
        },
        position: {
            type: 'array',
            defaultsTo: '[]'
        },

        furlough: {
            type: 'array',
            defaultsTo: '[]'
        },
        encryptedPassword: {
            type: 'string',
            required: true
        },

        contacts: {
            type: 'array',
            defaultsTo: [{"type": "", "value": ""}]
        },

        fired: {
            type: 'boolean',
            defaultsTo: false
        },

        firedDate: {
            type: 'date',
            defaultsTo: null
        },

        dateInWork: {
            type: 'date',
            defaultsTo: null
        },
        //dateFurlough: {
        //    type: 'date',
        //    defaultsTo: null
        //},
        decree: {
            type: 'date',
            defaultsTo: null
        },
        room: {
            type: 'string'
        },

        location: {
            type: 'string'
        },

        pfr: {
            type: 'string',
            size: 15
        },

        numCar: {
            type: 'string',
            size: 9
        },
        brandCar: {
            type: 'string',
            size: 50
        },

        parking: {
            type: 'integer'
        },
        park: {
            type: 'string'
        },
        workplace: {
            type: 'string'
        },

        lastLoggedIn: {
            type: 'date',
            required: true,
            defaultsTo: new Date(0)
        },

        gravatarUrl: {
            type: 'string'
        },

        avatarUrl: {
            type: 'string'
        },

        departments: {
            collection: 'department',
            via: 'users',
            dominant: true
        },

        positions: {
            collection: 'position',
            via: 'users',
            dominant: true
        },
        skds: {
            collection: 'skd',
            via: 'users',
            dominant: true
        },

        //interface:{
        //    type: 'string'
        //},
        interfaces:{
            collection: 'interface',
            via: 'users',
            dominant: true
        },
        //vacations: {
        //    collection: 'vacation',
        //    via: 'users',
        //    dominant: true
        //},

        /**
         * согласующий
         */
        matchings:{
            collection: 'user',
            via: 'owner'
        },
        owner: {
            collection: 'user',
            via: 'matchings'
        },
        vacationWhomCreated: {
            collection: 'vacation'
        },
        vacationWhomUpdated: {
            collection: 'vacation'
        },
        vacations: {
            collection: 'vacation'
        },

        getFullName: function () {
            return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        },
        getShortName: function () {
            return this.lastName + ' ' + this.firstName.substr(0, 1) + '.' + this.patronymicName.substr(0, 1) + '.';
        }

    }
};

