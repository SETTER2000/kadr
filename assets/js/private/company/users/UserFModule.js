angular.module('UserFModule', ['ui.router', 'toastr', 'ngResource', 'ngMaterial',
        'AttendanceModule', 'angularFileUpload', 'ngAnimate', 'ng-fx', 'angularMoment'])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.company.users', {
                url: '/users',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/tpl/list.tpl.html',
                        controller: 'ListFController'
                    },
                    "actionView@home.company.users": {templateUrl: '/js/private/company/users/views/home.users.action.html'}
                }
            })
            //.state('home.company.users.settings', {
            //    url: '/settings',
            //    templateUrl: '/js/private/company/users/views/home.company.users.settings.html',
            //    controller: 'ListFController'
            //})
            //.state('home.company.users.list', {
            //    url: '/list',
            //    views: {
            //        'list@home.company.users': {
            //            templateUrl: '/js/private/company/users/views/home.company.users.list.html',
            //            controller: 'ListFController'
            //        }
            //    }
            //})
            //.state('home.company.users.work', {
            //    url: '/work',
            //    views: {
            //        'list@home.company.users': {
            //            templateUrl: '/js/private/company/users/views/home.company.users.work.html',
            //            controller: 'ListFController'
            //        }
            //    }
            //})
            .state('home.company.users.attendance', {
                url: '/attendance',
                views: {
                    'attendance@home.company.users': {
                        templateUrl: '/js/private/company/attendances/tpl/list.tpl.html',
                        controller: 'ListAttendanceController'
                    }
                }
            })
            .state('home.company.users.edit', {
                url: '/edit/:userId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/tpl/edit.tpl.html',
                        controller: 'EditFController'
                    }
                }
            })
            .state('home.company.user', {
                url: '/user/:userId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/tpl/show.tpl.html',
                        controller: 'UserFController'
                    }
                }
            })
            .state('home.company.users.create', {
                url: '/create/:userId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/tpl/edit.tpl.html',
                        controller: 'EditFController'
                    }
                }
            })
            .state('home.company.users.administration', {
                url: '/administration',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/tpl/administration.tpl.html',
                        controller: 'AdministrationController'
                    }
                }
            })
            .state('home.file.upload', {
                url: 'upload',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/users/views/upload.html',
                        controller: 'EditFController'
                    }
                }
            })
            //.state('home.company.users.exit', {
            //    url: '/exit',
            //    views: {
            //        '@': {
            //            templateUrl: '/js/private/company/users/tpl/exit.html',
            //            controller: 'EditFController'
            //        }
            //    }
            //})
        ;
    })
    .constant('CONF_MODULE_USER', {baseUrl: '/users/:userId'})
    .run(function ($rootScope, $state, $stateParams, amMoment) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        amMoment.changeLocale('ru');
    })
    .factory('UsersF', function ($resource, $state, CONF_MODULE_USER) {
        var UsersF = $resource(
            CONF_MODULE_USER.baseUrl,
            {userId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );
        UsersF.prototype.formatDate = function (date) {
            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;
            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;
            var yy = date.getFullYear();
            if (yy < 10) yy = '0' + yy;
            return yy + '-' + mm + '-' + dd;
        };


        UsersF.prototype.getFullName = function () {
            return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        };
        UsersF.prototype.getShortName = function () {
            return this.lastName + ' ' + this.firstName.substr(0, 1) + '.' + this.patronymicName.substr(0, 1) + '.';
        };
        UsersF.prototype.sc = function () {
            return this.section;
        };
        UsersF.prototype.scs = function () {
            return this.sections;
        };
        UsersF.prototype.ok = function () {
            return alert('Сотрудник: ' + this.getFullName() + ' изменён!');
        };
        UsersF.prototype.er = function () {
            return alert('ОШИБКА!!! Сотрудник: ' + this.getFullName() + ' - изменения не приняты!');
        };
        UsersF.prototype.getAvatar = function () {
            return this.avatarUrl;
        };
        //UsersF.prototype.delFoto= function () {
        //    return this.avatarUrl = '';
        //};
        UsersF.prototype.lastDateSetting = function () {
            return new Date();
        };
        UsersF.prototype.getBirthday = function () {
            if (this.birthday) {
                var tm;
                tm = new Date(this.birthday);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.birthday = tm;
            }
        };
        UsersF.prototype.getDateInWork = function () {
            if (this.dateInWork) {
                var tm;
                tm = new Date(this.dateInWork);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.dateInWork = tm;
            }
        };
        UsersF.prototype.getFiredDate = function () {
            if (this.firedDate) {
                var tm;
                tm = new Date(this.firedDate);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.firedDate = tm;
            }
        };
        UsersF.prototype.getDecree = function () {
            if (this.decree) {
                var tm;
                tm = new Date(this.decree);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.decree = tm;
            }
        };
        UsersF.prototype.getCreatedAt = function () {
            if (!this.createdAt) {
                return 'Mongo import';
            }
            return this.createdAt;
        };
        UsersF.prototype.getCurrentDate = function () {
            var t = this.formatDate(new Date());
            return t;
        };

        UsersF.prototype.periodWork = function () {
            var now = moment();
            var event = moment(this.dateInWork, ["DD.MM.YYYY"]);
            return moment.preciseDiff(now, event);
        };
        UsersF.prototype.getListUrl = function () {
            return '/company/users';
        };
        UsersF.prototype.getEditUrl = function (id) {
            return '/company/users/edit/' + id;
        };
        UsersF.prototype.getShowUrl = function (id) {
            return '/company/user/' + id;
        };
        UsersF.prototype.deactivation = function () {
            return ' - деактивирован';
        };
        UsersF.prototype.getContact = function (type) {
            for (var i in this.contacts) {
                if (this.contacts[i].type === type) {
                    return this.contacts[i].value;
                    //return this.contacts[i].type + ': ' + this.contacts[i].value;
                }
            }
        };
        UsersF.prototype.forrbidden = function () {
            return ' - уволены';
        };
        return UsersF;
    })
;
