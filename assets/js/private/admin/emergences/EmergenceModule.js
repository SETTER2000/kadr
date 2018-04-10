angular.module('EmergenceModule', ['ui.router', 'toastr', 'ngResource', 'ngMaterial','ngMessages',
        'angularFileUpload', 'ngAnimate', 'ng-fx', 'angularMoment', 'ngSanitize', 'ngDialog'])
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }])

    .config(function ($stateProvider) {
        $stateProvider
            .state('home.admin.emergences', {
                url: '/emergences',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/emergences/tpl/list.tpl.html',
                        controller: 'ListEmergenceController'
                    },
                    "actionView@home.admin.emergences": {templateUrl: '/js/private/admin/emergences/views/tables.html'}
                }
            })
            //
            .state('home.admin.emergences.edit', {
                url: '/edit/:emergenceId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/emergences/tpl/edit.tpl.html',
                        controller: 'EditEmergenceController'
                    }
                }
            })
            .state('home.admin.emergence', {
                url: '/emergence/:emergenceId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/emergences/tpl/show.tpl.html',
                        controller: 'EmergenceController'
                    }
                }
            })
            .state('home.admin.emergences.create', {
                url: '/create/:emergenceId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/emergences/tpl/edit.tpl.html',
                        controller: 'EditEmergenceController'
                    }
                }
            })
            .state('home.admin.emergences.administration', {
                url: '/administration',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/emergences/tpl/administration.tpl.html',
                        controller: 'AdministrationEmergenceController'
                    }
                }
            });
    })
    .constant('CONF_MODULE_EMERGENCE', {baseUrl: '/emergences/:emergenceId'})
    .run(function ($rootScope, $state, $stateParams, amMoment) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        amMoment.changeLocale('ru');
    })
    .factory('Emergences', function ($resource, $state, $rootScope, $http, Users, CONF_MODULE_EMERGENCE) {
        var Emergences = $resource(
            CONF_MODULE_EMERGENCE.baseUrl,
            {emergenceId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                },
                go: false,
            }
        );
        Emergences.prototype.formatDate = function (date) {
            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;
            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;
            var yy = date.getFullYear();
            if (yy < 10) yy = '0' + yy;
            return yy + '-' + mm + '-' + dd;
        };
        Emergences.prototype.getFullName = function () {
            if (this.lastName && this.firstName && this.patronymicName) {
                return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
            } else {
                if (this.lastName && this.firstName) {
                    return this.lastName + ' ' + this.firstName;
                } else {
                    if (this.lastName) {
                        return this.lastName;
                    } else {
                        return '';
                    }
                }
            }
        };

        Emergences.prototype.getNewEmployees = function () {
            this.name = '';
            return (this.name === '') ? this.name = 'Выход нового сотрудника' : this.name;
            //return (!this.name) ? this.name = 'График отпусков на ' + this.year : this.name;
        };
        Emergences.prototype.getYear = function () {
            if (!this.year) {
                return this.year = moment().add(1, 'years').get('year');
            }
            return this.year;
        };

        Emergences.prototype.popupSender = function () {
            $http.get('/emergence/logSender/' + this.id).then(function (response) {
                console.log('LOG SENDER', response.data);
                this.top = response.data;
            });

        };

        Emergences.prototype.formatDate = function () {
            return this.outputEmployee = (this.outputEmployee) ? new Date(this.outputEmployee) : new Date();
        };
        Emergences.prototype.goOpen = function () {
            return this.go = (this.go) ? false : true;
        };
        Emergences.prototype.goClose = function () {
            return this.go = false;
        };
        Emergences.prototype.getShortName = function () {
            return this.lastName + ' ' + this.firstName.substr(0, 1) + '.' + this.patronymicName.substr(0, 1) + '.';
        };
        Emergences.prototype.sc = function () {
            return this.section;
        };
        Emergences.prototype.scs = function () {
            return this.sections;
        };
        Emergences.prototype.nameLinkFn = function () {
            return (this.hasOwnProperty('htmlData') && this.htmlData.length) ? 'Редактировать шаблон' : 'Вставить шаблон';
        };
        Emergences.prototype.getAllUsers = function () {
            $rootScope.$broadcast('getAllUsers', {
                message: 'dgdfgdfgdfg'
            });

        };
        //Emergences.prototype.ok = function () {
        //    return alert('Сотрудник: ' + this.getFullName() + ' изменён!');
        //};
        //Emergences.prototype.getDaysSelected = function () {
        //    $http.get('/emergence/to-years?year=2018')
        //        .then(function (days) {
        //            console.log('DAYS HOLIDAYS', days);
        //            return ;
        //        });
        //};
        Emergences.prototype.getAvatar = function () {
            return this.avatarUrl;
        };
        Emergences.prototype.lastDateSetting = function () {
            return new Date();
        };
        Emergences.prototype.getDateInWork = function () {
            if (this.dateInWork) {
                var tm;
                tm = new Date(this.dateInWork);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.dateInWork = tm;
            }
        };
        Emergences.prototype.getFiredDate = function () {
            if (this.firedDate) {
                var tm;
                tm = new Date(this.firedDate);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.firedDate = tm;
            }
        };
        Emergences.prototype.getDecree = function () {
            if (this.decree) {
                var tm;
                tm = new Date(this.decree);
                var month = ((+tm.getMonth() + 1) < 10) ? '0' + (+tm.getMonth() + 1) : (+tm.getMonth() + 1);
                var date = (+tm.getDate() < 10) ? '0' + tm.getDate() : tm.getDate();
                tm = date + '.' + month + '.' + tm.getFullYear();
                this.decree = tm;
            }
        };
        Emergences.prototype.getCreatedAt = function () {
            if (!this.createdAt) {
                return 'Mongo import';
            }
            return this.createdAt;
        };
        Emergences.prototype.getCurrentDate = function () {
            var t = this.formatDate(new Date());
            return t;
        };
        Emergences.prototype.periodWork = function () {
            var now = moment();
            var event = moment(this.dateInWork, ["DD.MM.YYYY"]);
            return moment.preciseDiff(now, event);
        };
        Emergences.prototype.getListUrl = function () {
            return '/admin/emergences';
        };
        Emergences.prototype.getShowUrl = function (id) {
            return '/admin/emergence/' + id;
        };
        Emergences.prototype.deactivation = function () {
            return ' - деактивирован';
        };
        Emergences.prototype.getContact = function (type) {
            for (var i in this.contacts) {
                if (this.contacts[i].type === type) {
                    return this.contacts[i].value;
                    //return this.contacts[i].type + ': ' + this.contacts[i].value;
                }
            }
        };
        return Emergences;
    })
    /**
     * Выборка фамилий по первой букве
     */
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
    .filter("firedEmergence", function () {
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
    .filter('deadline', function () {
        return function (value) {
            moment.locale('ru');
            console.log(moment(new Date(value)).fromNow());
            if (angular.isString(value)) {
                return moment(new Date(value)).fromNow();
            }
            return value;
        }
    })

;
