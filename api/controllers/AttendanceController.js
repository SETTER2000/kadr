'use strict';
/**
 * AttendanceController
 *
 * @description :: Server-side logic for managing attendances
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */






module.exports = {

    getQuery: function (req, res) {
        Attendance.query(
            'SELECT * FROM attendance AS a ' +
            'LEFT JOIN attendance_employees AS ae ' +
            'ON a.id=ae.attendance_id ' +
            'LEFT JOIN  employees AS e ' +
            'ON e.id = ae.employees_id ' +
            'WHERE e.lname= ? AND e.fname=? AND e.pname=?',
            // Attendance.query('SELECT * FROM attendance WHERE attendance.id = ?',
            // ['1208']
            // {id: req.param('id'), limit: req.param('limit')}
            // [req.param('lname'),req.param('fname'),req.param('pname')]
            [req.param('lastName'), req.param('firstName'), req.param('patronymicName')]
            // [req.allParams()]
            , function (err, attendance) {
                if (err) {
                    return res.serverError(err);
                }
                // sails.log(req.allParams());
                //sails.log(attendance);
                return res.json(attendance);
            });
    },

    timeAll: function (req, res) {
        //if (!req.session.me) {
        //    return res.view('public/header', {layout: 'homepage'});
        //}
        var table = ['calendar_group', 'calendar_group_clear_time'];
        var time = table[0];
        if (req.param('timeClear') > 0) {
            time = table[1];
        }
        Attendance.query(
            "SELECT * " +
            "FROM  " + time +
            " WHERE date BETWEEN ? AND ? ",
            [req.param('startDate'), req.param('endDate')],
            function (err, attendance) {
                if (err) {
                    return res.serverError(err);
                }
                return res.json(attendance);
            });
    },

    fPeriod: function (req, res) {
        Attendance.query(
            "SELECT " +
            "lname, " +
            "fname, " +
            "pname, " +
            "DATE_FORMAT(date,GET_FORMAT(DATE,'EUR')) as date, " +
            "time_in, " +
            "time_out, " +
            "DATE_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, time_in, time_out)), GET_FORMAT(TIME, 'JIS')) as rz " +
            "FROM attendance_employees AS ae " +
            "LEFT JOIN employees AS e " +
            "ON ae.employees_id = e.id " +
            "LEFT JOIN attendance AS a " +
            "ON ae.attendance_id = a.id " +
            "WHERE a.date BETWEEN ? AND ? " +
            "ORDER BY date,lname " +
            "LIMIT " + (req.param('page') * req.param('limit')) + ", " + req.param('limit'),
            [req.param('startDate'), req.param('endDate')],
            function (err, attendance) {
                if (err) {
                    return res.serverError(err);
                }
                return res.json(attendance);
            });
        //.paginate({page: req.param('page'), limit: req.param('limit')})
        //.populate('employees')

    },

    findPeriod: function (req, res) {
        Attendance.find({date: {'>': new Date(req.param('startDate')), '<': new Date(req.param('endDate'))}, sort: 'date'})
            .paginate({page: req.param('page'), limit: req.param('limit')})
            .populate('employees')
            .exec(function (err, attendanceEmployees) {
                if (err)  return res.negotiate(err);
                //res.send(attendanceEmployees);
                return res.json(attendanceEmployees);

                /* SELECT *
                 FROM `attendance_employees` AS ae
                 LEFT JOIN employees AS e
                 ON ae.employees_id = e.id
                 LEFT JOIN attendance AS a
                 ON ae.attendance_id = a.id
                 WHERE a.date BETWEEN '2017-03-01' AND '2017-03-31';*/


                // The users object would look something like the following
                // [{
                //   id: 123,
                //   firstName: 'Foo',
                //   lastName: 'Bar',
                //   pets: [{
                //     id: 1,
                //     breed: 'labrador',
                //     type: 'dog',
                //     name: 'fido',
                //     user: 123
                //   }]
                // }]
            });

        //Attendance.find({
        //    //date: ["2016-01-21","2017-02-10"]
        //    date: {'>': new Date(req.param('startDate')), '<': new Date(req.param('endDate'))},sort:'date'
        //    //date: ["2017-03-01", "2017-03-02", "2017-03-03", "2017-03-04", "2017-03-05", "2017-03-06", "2017-03-07", "2017-03-08", "2017-03-09", "2017-03-10", "2017-03-11", "2017-03-12", "2017-03-13", "2017-03-14", "2017-03-15"]
        //}).paginate({page: req.param('page'), limit: req.param('limit')}).exec(function (err, waltersAndSkylers) {
        //    //sails.log(waltersAndSkylers);
        //    if (err)  return res.negotiate(err);
        //    res.json(waltersAndSkylers);
        //});
    },

    findOne: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Attendance.findOne(req.param('id'), function foundDepartment(err, attendance) {
            if (err) return next(err);
            if (!attendance) return next();

            // return res.redirect('/admin/users/edit/' + req.param('id'));
            // return res.backToHomePage();
            //return res.redirect('/admin/users/edit/' + req.param('id'));
            res.view({
                attendance: attendance, me: req.session.me
            });
        });
    }
};

