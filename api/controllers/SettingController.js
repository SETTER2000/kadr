/**
 * EmergenceController
 * Выход нового сотрудника
 * @description :: TODO: общие настройки модулей
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ObjectId = require('mongodb').ObjectId;
const zone = "Europe/Moscow";
var Moment = require('moment-timezone');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
moment.locale('ru');
const _ = require('lodash');
const async = require('async');
const path = require('path');
const fs = require('fs');
const http = require('http');


module.exports = {

    /**
     * Получить настройки для определённого модуля
     * @param req
     * @param res
     * @returns {*}
     */
    get: function (req, res) {
        "use strict";
        //console.log(req.params.all());
        //console.log(req.param('name'));
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        if (_.isUndefined(req.param('name'))) return res.badRequest('Нет названия модуля, для которого получаете настройки.');
        Setting.findOne({name:req.param('name')})
            .exec((err, findSettings)=>{
                if(err) return res.negotiate(err);
                //console.log('RESPONSE SETTINGS:',findSettings);
                res.send(findSettings);
            });
    },
    /**
     * Включить/выключить отправку почты с модуля Emergence
     * @param req
     * @param res
     */
    checkSenderEmergence: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Setting.findOrCreate({name: req.param('module')}, {name: req.param('module')})
            .exec((err, createdOrFoundRecords)=> {
                Setting.update({name: createdOrFoundRecords.name}, {
                    checkSender: req.param('change')
                }).exec(function (err, update) {
                    if (err) return res.negotiate(err);
                    return res.ok();
                });
            });

    }


};

