'use strict';
/**
 * CalendarController
 *
 * @description :: Server-side logic for managing calendars
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
//var Pcru = require('pc-ru');
//const pc = new Pcru('66b25fa9cdb07b473c217c61e3bfa47d');
module.exports = {

    findOne: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Calendar.findOne(req.param('id'), function foundCalendar(err, calendar) {
            if (err) return next(err);
            if (!calendar) return next();

            // return res.redirect('/admin/users/edit/' + req.param('id'));
            // return res.backToHomePage();
            //return res.redirect('/admin/users/edit/' + req.param('id'));
            res.view({
                calendar: calendar, me: req.session.me
            });
        });
    },

    findCalendars:function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        if(req.param('id')){
            Calendar.findOne(req.param('id'))
                .exec(function foundUser(err, calendar) {
                    if (err) return res.serverError(err);
                    if (!calendar) return res.notFound();
                    ///**
                    // * Получить все данные за год.
                    // * По умолчанию текущий год.
                    // * Установить год (>1998) для календаря если нужно.
                    // */
                    //pc.getCalendar();
                    //
                    ///**
                    // * Получить все праздничные дни год/месяц, если указать параметр monthNumber:
                    // * '1'  январь
                    // * '2'  февраль
                    // * '3'  март
                    // * и т.д.
                    // */
                    //pc.getHolidays();
                    //pc.getHolidays(['1','2','3']);
                    // sails.log(calendar);
                    res.ok(calendar);
                });
        }else{
            Calendar.find()
                .exec(function foundUser(err, calendars) {
                    if (err) return res.serverError(err);
                    if (!calendars) return res.notFound();
                    res.ok(calendars);
                });
        }
    },

    addCalendar: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id')).exec(function (err, user) {
            if (err) return next(err);
            user.calendars.add({name: 'Программисты'});
            user.save(function (err) {
                if (err) return next(err);
                res.send('OK!!!!!');
            });
        })
    },

    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        var obj = {
            name: req.param('name'),
            type: req.param('type'),
            location: req.param('location'),
            action: req.param('action'),
            slug: req.param('slug'),
            description: req.param('description')
        };
        Calendar.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
            if (err)return res.negotiate(err);
            //if (err) {
            //    return res.redirect('/admin/departments/edit/' + req.param('id'));
            //}
            //res.redirect('/admin/users/show/' + req.param('id'));
            // res.location('/home/admin/departments');
            res.ok();
        })
    },

    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Calendar.findOne(req.param('id'), function foundUser(err, user) {
            if (err)return next(err);
            if (!user)return next('Calendar doesn\'t exists.');
            Calendar.destroy(req.param('id'), function userDestroyed(err) {
                if (err)return next(err);
            });
            res.ok();
        });
    }
};

