/**
 * DepartmentController
 *
 * @description :: Server-side logic for managing departments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    findOne: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Department.findOne(req.param('id'), function foundDepartment(err, department) {
            if (err) return next(err);
            if (!department) return next();

            // return res.redirect('/admin/users/edit/' + req.param('id'));
            // return res.backToHomePage();
            //return res.redirect('/admin/users/edit/' + req.param('id'));
            res.view({
                department: department, me: req.session.me
            });
        });

    },

    findDepartments:function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        if(req.param('id')){
            Department.findOne(req.param('id'))
                .exec(function foundUser(err, department) {
                    if (err) return res.serverError(err);
                    if (!department) return res.notFound();
                    res.ok(department);
                });
        }else{
            Department.find()
                .exec(function foundUser(err, departments) {
                    if (err) return res.serverError(err);
                    if (!departments) return res.notFound();
                    res.ok(departments);
                });
        }
    },

    createDepartment: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});

        Department.create(req.body).exec(function (err, finn) {
            if(err) {return res.serverError(err);}
            sails.log('Finn\'s id is:', finn.id);
            return res.ok();
        });
    },

    addDepartment: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne(req.param('id')).exec(function (err, user) {
            if (err) return next(err);

            // Queue up a new pet to be added and a record to be created in the join table
            user.departments.add({name: 'Программисты', type: 'IT', location: '2 этаж'});

            // Save the user, creating the new pet and associations in the join table
            user.save(function (err) {
                if (err) return next(err);

                res.send('OK!!!!!');
            });

        })
    },

    update: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        //req.params.all()
        Department.update(req.param('id'))
            .set(
                // {
                //     name: req.param('name'),
                //     type: req.param('type'),
                //     location: req.param('location')
                //
                // }
                req.body
            )
            .exec(function (err) {
                if (err)return res.negotiate(err);
                //if (err) {
                //    return res.redirect('/admin/departments/edit/' + req.param('id'));
                //}
                //res.redirect('/admin/users/show/' + req.param('id'));
                // res.location('/home/admin/departments');
                res.ok();
            }) 
    },
        // update: function (req, res, next) {
    //     //req.params.all()
    //     Department.update(req.param('id'), {
    //         name: req.param('name'),
    //         type: req.param('type'),
    //         location: req.param('location')
    //
    //     }, function departmentUpdate(err) {
    //         if (err)return res.negotiate(err);
    //         //if (err) {
    //         //    return res.redirect('/admin/departments/edit/' + req.param('id'));
    //         //}
    //         //res.redirect('/admin/users/show/' + req.param('id'));
    //         res.ok();
    //     });
    // }
    destroy: function (req, res, next) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        Department.findOne(req.param('id'), function foundUser(err, user) {
            if (err)return next(err);
            if (!user)return next('Position doesn\'t exists.');
            Department.destroy(req.param('id'), function userDestroyed(err) {
                if (err)return next(err);
            });
            res.ok();
        });
    }
};

