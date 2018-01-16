angular.module('ScheduleModule', ['ui.router', 'toastr', 'ngResource', 'ngMaterial',
        'angularFileUpload', 'ngAnimate', 'ng-fx', 'angularMoment', 'ngSanitize', 'ngDialog'])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.admin.schedules', {
                url: '/schedules',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/schedules/tpl/list.tpl.html',
                        controller: 'ListScheduleController'
                    },
                    "actionView@home.admin.schedules": {templateUrl: '/js/private/admin/schedules/views/tables.html'}
                }
            })
            //.state('home.admin.schedules.settings', {
            //    url: '/settings',
            //    templateUrl: '/js/private/admin/schedules/views/home.admin.schedules.settings.html',
            //    controller: 'ListScheduleController'
            //})
            //.state('home.admin.schedules.list', {
            //    url: '/list',
            //    views: {
            //        'list@home.admin.schedules': {
            //            templateUrl: '/js/private/admin/schedules/views/home.admin.schedules.list.html',
            //            controller: 'ListScheduleController'
            //        }
            //    }
            //})
            //.state('home.admin.schedules.work', {
            //    url: '/work',
            //    views: {
            //        'list@home.admin.schedules': {
            //            templateUrl: '/js/private/admin/schedules/views/home.admin.schedules.work.html',
            //            controller: 'ListScheduleController'
            //        }
            //    }
            //})
            //.state('home.admin.schedules.attendance', {
            //    url: '/attendance',
            //    views: {
            //        'attendance@home.admin.schedules': {
            //            templateUrl: '/js/private/admin/attendances/tpl/list.tpl.html',
            //            controller: 'ListAttendanceController'
            //        }
            //    }
            //})
            .state('home.admin.schedules.edit', {
                url: '/edit/:scheduleId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/schedules/tpl/edit.tpl.html',
                        controller: 'EditScheduleController'
                    }
                }
            })
            .state('home.admin.schedule', {
                url: '/schedule/:scheduleId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/schedules/tpl/show.tpl.html',
                        controller: 'ScheduleController'
                    }
                }
            })
            .state('home.admin.schedules.create', {
                url: '/create/:scheduleId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/schedules/tpl/edit.tpl.html',
                        controller: 'EditScheduleController'
                    }
                }
            })

            //.state('home.admin.schedules.administration', {
            //    url: '/administration',
            //    views: {
            //        '@': {
            //            templateUrl: '/js/private/admin/schedules/tpl/administration.tpl.html',
            //            controller: 'AdministrationController'
            //        }
            //    }
            //})
            //.state('home.file.upload', {
            //    url: 'upload',
            //    views: {
            //        '@': {
            //            templateUrl: '/js/private/admin/schedules/views/upload.html',
            //            controller: 'EditScheduleController'
            //        }
            //    }
            //})
            //.state('home.admin.schedules.exit', {
            //    url: '/exit',
            //    views: {
            //        '@': {
            //            templateUrl: '/js/private/admin/schedules/tpl/exit.html',
            //            controller: 'EditScheduleController'
            //        }
            //    }
            //})
        ;
    })
    .constant('CONF_MODULE_SCHEDULE', {baseUrl: '/schedules/:scheduleId'})
    .run(function ($rootScope, $state, $stateParams, amMoment) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        amMoment.changeLocale('ru');
    })
    .factory('Schedules', function ($resource, $state, $rootScope, $http, Users, CONF_MODULE_SCHEDULE) {
        var Schedules = $resource(
            CONF_MODULE_SCHEDULE.baseUrl,
            {scheduleId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );
        Schedules.prototype.formatDate = function (date) {
            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;
            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;
            var yy = date.getFullYear();
            if (yy < 10) yy = '0' + yy;
            return yy + '-' + mm + '-' + dd;
        };
        Schedules.prototype.getFullName = function () {
            return (!this.name) ? this.name = 'График отпусков на ' : this.name;
            //return (!this.name) ? this.name = 'График отпусков на ' + this.year : this.name;
        };
        Schedules.prototype.getYear = function () {
            if (!this.year) {
                return this.year = moment().add(1, 'years').get('year');
            }
            return this.year;
        };
        Schedules.prototype.getShortName = function () {
            return this.lastName + ' ' + this.firstName.substr(0, 1) + '.' + this.patronymicName.substr(0, 1) + '.';
        };
        Schedules.prototype.sc = function () {
            return this.section;
        };
        Schedules.prototype.scs = function () {
            return this.sections;
        };
        Schedules.prototype.nameLinkFn = function () {
            return (this.hasOwnProperty('htmlData') && this.htmlData.length) ? 'Редактировать шаблон' : 'Вставить шаблон';
        };
        Schedules.prototype.getAllUsers = function () {
            $rootScope.$broadcast('getAllUsers', {
                message: 'dgdfgdfgdfg'
            });

        };
        //Schedules.prototype.ok = function () {
        //    return alert('Сотрудник: ' + this.getFullName() + ' изменён!');
        //};
        //Schedules.prototype.getDaysSelected = function () {
        //    $http.get('/schedule/to-years?year=2018')
        //        .then(function (days) {
        //            console.log('DAYS HOLIDAYS', days);
        //            return ;
        //        });
        //};
        Schedules.prototype.getAvatar = function () {
            return this.avatarUrl;
        };
        Schedules.prototype.lastDateSetting = function () {
            return new Date();
        };
        Schedules.prototype.getDateInWork = function () {
            if (this.dateInWork) {
                var tm;
                tm = new Date(this.dateInWork);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.dateInWork = tm;
            }
        };
        Schedules.prototype.getFiredDate = function () {
            if (this.firedDate) {
                var tm;
                tm = new Date(this.firedDate);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.firedDate = tm;
            }
        };
        Schedules.prototype.getDecree = function () {
            if (this.decree) {
                var tm;
                tm = new Date(this.decree);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.decree = tm;
            }
        };
        Schedules.prototype.getCreatedAt = function () {
            if (!this.createdAt) {
                return 'Mongo import';
            }
            return this.createdAt;
        };
        Schedules.prototype.getCurrentDate = function () {
            var t = this.formatDate(new Date());
            return t;
        };
        Schedules.prototype.periodWork = function () {
            var now = moment();
            var event = moment(this.dateInWork, ["DD.MM.YYYY"]);
            return moment.preciseDiff(now, event);
        };
        Schedules.prototype.getListUrl = function () {
            return '/admin/schedules';
        };
        Schedules.prototype.getShowUrl = function (id) {
            return '/admin/schedule/' + id;
        };
        Schedules.prototype.deactivation = function () {
            return ' - деактивирован';
        };
        Schedules.prototype.getContact = function (type) {
            for (var i in this.contacts) {
                if (this.contacts[i].type === type) {
                    return this.contacts[i].value;
                    //return this.contacts[i].type + ': ' + this.contacts[i].value;
                }
            }
        };
        return Schedules;
    })
    /**
     * Выборка фамилий по первой букве
     */
    .filter('firstChar', function () {
        return function (value, param, char) {
            if (char.length > 0) {
                if (angular.isArray(value) && angular.isString(param)) {
                    var arr = [];
                    for (var i = 0, ii = value.length; i < ii; i++) {
                        if (value[i].getFullName()[0] === char) {
                            arr.push(value[i]);
                        }
                    }
                    return arr;
                }
            }
            return value;
        }
    })
    .filter("skipItems", function () {
        return function (value, count) {
            // isArray - проверка, что переменная является массивом
            // isNumber - проверка, что переменная является числом
            if (angular.isArray(value) && angular.isNumber(count)) {
                if (count > value.length || count < 1) {
                    return value;
                } else {
                    return value.slice(count);
                }
            } else {
                return value;
            }
        }
    })
    .filter('ownerVacation', function () {
        /**
         * Фильтр отдаёт персонажей с моментом загрузки больше или равно 6 месяцам
         */
        return function (value) {
            // isArray - проверка, что переменная является массивом
            if (angular.isArray(value)) {
                var arr = [];
                value.forEach(function (v, k, ar) {
                    if (moment().diff(moment(v.dateInWork), 'months') >= 6)arr.push(v);
                });
                return arr;
            }
            return value;
        }
    })
    .filter("firedSchedule", function () {
        return function (value) {
            if (!angular.isArray(value)) return value;
            let arr = [];
            value.forEach(function (v, k, a) {
                if (!v['owner'].fired) arr.push(v);
            });
            return arr;
        }
    })
    .filter('countSelectedDays', function () {
        return function (value) {
            if (angular.isArray(value)) {
                let d = 0;
                let result = [];
                let y = {};
                value.forEach(function (v, k, a) {
                    if (angular.isArray(y[v.owner])) {
                        y[v.owner].push(v.daysSelectHoliday);
                    } else {
                        y[v.owner] = [];
                        y[v.owner].push(v.daysSelectHoliday);
                    }
                });
                for (var prop in y) {
                    result.push(y[prop].reduce(function (sum, current) {
                        return sum + current;
                    }, 0));
                }
                result.forEach(function (v) {
                    if (v >= 28) d++;
                });
                return d;
            } else {
                return value;
            }
        }
    })

;
