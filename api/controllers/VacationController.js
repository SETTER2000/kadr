/**
 * VacationController
 *
 * @description :: Server-side logic for managing vacations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Получить объект
     * @param req
     * @param res
     */
    get: function (req, res) {
        "use strict";
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
            if (!_.isUndefined(req.param('where')) && req.param('char').length > 1) {
                var q = {
                    limit: req.params.limit,
                    sort: req.params.sort
                };
                var y = {};
                y[req.param('property')] = {'like': req.param('char')};
                q.where = y;
                User.find(q)
                    .populate('vacations')
                    .populate('positions')
                    .exec(function foundUser(err, users) {
                        if (err) return res.serverError(err);
                        if (!users) return res.notFound();
                        let us=[];
                        _.forEach(users, function(user) {
                            us.push({'owner':user.id});
                        });
                        Vacation.find(us)
                            .populate('furlough')
                            .populate('owner')
                            .populate('whomCreated')
                            .populate('whomUpdated')
                            .exec(function foundVacation(err, vacations) {
                                if (err) return res.serverError(err);
                                if (!vacations) return res.notFound();
                                return res.ok(vacations);
                            });
                    });
            }
            else {
                Vacation.find(req.param('id'))
                    .populate('furlough')
                    .populate('owner')
                    .populate('whomCreated')
                    .populate('whomUpdated')
                    .exec(function foundVacation(err, vacations) {
                        if (err) return res.serverError(err);
                        if (!vacations) return res.notFound();
                        if (err) return res.negotiate;
                        if (!vacations) return res.notFound();
                        (req.param('id')) ? res.ok(vacations[0]) : res.ok(vacations);
                    });
            }
    },


    /**
     * Создать
     * @param req
     * @param res
     * @returns {*}
     */
    create: function (req, res) {
        //if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //if (!_.isString( req.param('name') ) ) {
        //    //sails.log(req.param('name'));
        //    //sails.log('is not string');
        //    return res.badRequest('Наименование не заполнено.');
        //}
        if (!_.isNumber(req.param('daysSelectHoliday'))) return res.negotiate('Кол-во дней не число.');
        var obj = {
            section: 'Отпуск',
            sections: 'Отпуска',
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.session.me,
            whomUpdated: null,
            action: req.param('action')
            //action: (req.param('action')) ? req.param('action') : true
        };

        //if (_.isNumber(req.param('daysSelectHoliday'))) {
        //    sails.log('daysSelectHoliday',req.param('daysSelectHoliday'));
        //    //sails.log('is not string');
        //    obj.daysSelectHoliday = req.param('daysSelectHoliday');
        //
        //}

        User.findOne({id: req.session.me})
            .populate('vacationWhomCreated')
            .populate('vacations')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                console.log('findParam:', findUser);
                //obj.vacationWhomCreated = findUser.id;
                obj.owner = findUser.id;
                obj.whomCreated = findUser.id;


                Furlough.findOne(req.param('furlough'))
                    .populate('vacations')
                    .exec((err, findFurlough)=> {
                        "use strict";
                        if (err) return res.serverError(err);
                        if (!findFurlough) return res.notFound('Не найдено!');
                        console.log('findFurloughЖЖЖ', findFurlough);
                        obj.furlough = findFurlough.id;
                        Vacation.create(obj).exec(function (err, createVacation) {
                            if (err) return res.serverError(err);
                            console.log('Отпуск создал:', req.session.me);
                            console.log('Отпуск новый:', createVacation);
                            findUser.vacations.add(createVacation.id);
                            findUser.vacationWhomCreated.add(createVacation.id);
                            //findUser.vacationWhomUpdated.add(finn.id);
                            findFurlough.vacations.add(createVacation.id);
                            findUser.save(function (err) {
                                if (err) return res.negotiate(err);
                                console.log('finn-7777777:', createVacation);
                                findFurlough.save(function (err) {
                                    if (err) return res.negotiate(err);
                                    console.log('finn:', createVacation);
                                    return res.send(createVacation);
                                });
                            });
                        });


                    });
            });
    },


    /**
     * Обновить
     * @param req
     * @param res
     */
    update: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        var obj = {
            id: req.param('id'),
            section: req.param('section'),
            sections: req.param('sections'),
            name: req.param('name'),
            daysSelectHoliday: +req.param('daysSelectHoliday'),
            whomCreated: req.param('whomCreated'),
            whomUpdated: req.session.me,
            action: req.param('action')
        };
        User.findOne({id: req.session.me})
            .populate('vacationWhomUpdated')
            .populate('vacations')
            .exec((err, findUser)=> {
                "use strict";
                if (err) return res.serverError(err);
                if (!findUser) return res.notFound();
                console.log('findParam:', findUser);
                //obj.vacationWhomCreated = findUser.id;
                //obj.owner = findUser.id;
                obj.whomUpdated = findUser.id;
                Vacation.update(req.param('id'), obj).exec(function updateObj(err, objEdit) {
                    if (err)return res.negotiate(err);
                    console.log('objEdit: ', objEdit);
                    console.log('Отпуск обновил:', findUser.lastName + ' ' + findUser.firstName);
                    console.log('Отпуск обновление:', obj);
                    findUser.vacationWhomUpdated.add(objEdit[0].id);
                    findUser.save(function (err) {
                        if (err) return res.negotiate(err);
                        res.ok();
                    });
                });
            });
    },


    /**
     * Удалить
     * @param req
     * @param res
     * @param next
     */
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Vacation.findOne(req.param('id')).exec((err, finds)=> {
            "use strict";
            if (err) return res.serverError(err);
            if (!finds) return res.notFound();

            Vacation.destroy(req.param('id'), (err) => {
                if (err)return next(err);
                console.log('Отпуск удалил:', req.session.me);
                console.log('Отпуск удалён:', finds);
                res.ok();
            });
        });

        // res.redirect('/admin/users');


    }
};

