angular.module('VacationModule', ['ui.router', 'toastr', 'ngResource', 'ngAnimate', 'angularMoment'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.admin.vacations', {
                url: '/vacations',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/vacations/tpl/list.tpl.html',
                        controller: 'ListVacationController'
                    }
                }
            })
            .state('home.admin.vacations.edit', {
                url: '/edit/:vacationId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/vacations/tpl/edit.tpl.html',
                        controller: 'EditVacationController'
                    }
                }
            })
            .state('home.admin.vacations.settings', {
                url: '/settings',
                templateUrl: '/js/private/admin/vacations/views/home.admin.vacations.settings.html',
                controller: 'ListVacationController'
            })
            .state('home.admin.vacation', {
                url: '/vacation/:vacationId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/departments/tpl/show.tpl.html',
                        controller: 'VacationController'
                    }
                }
            })
            .state('home.admin.vacations.create', {
                url: '/create/:vacationId',
                views: {
                    '@': {
                        templateUrl: '/js/private/admin/vacations/tpl/edit.tpl.html',
                        controller: 'EditVacationController'
                    }
                }
            })


        ;
    })
    .constant('CONF_MODULE_VACATION', {baseUrl: '/vacations/:vacationId'})
    .factory('Vacations', function ($resource, CONF_MODULE_VACATION) {

        var Vacations = $resource(
            CONF_MODULE_VACATION.baseUrl,
            {vacationId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );

        Vacations.prototype.formatDate = function (date) {

            var dd = date.getDate();
            if (dd < 10) dd = '0' + dd;

            var mm = date.getMonth() + 1;
            if (mm < 10) mm = '0' + mm;

            var yy = date.getFullYear();
            //var yy = date.getFullYear() % 100;
            if (yy < 10) yy = '0' + yy;

            return yy + '-' + mm + '-' + dd;
            //return dd + '.' + mm + '.' + yy;
        };

        Vacations.prototype.getFullName = function () {
            return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        };

        Vacations.prototype.sc = function () {
            return this.section;
        };
        Vacations.prototype.scs = function () {
            return this.sections;
        };

        Vacations.prototype.ok = function () {
            return alert(this.sc() + ': ' + this.name + ' изменёна!');
        };

        //Vacations.prototype.getAction = function (boolean) {
        //   return  (!boolean) ? true : this.action;
        //};
        Vacations.prototype.er = function () {
            return alert('ОШИБКА!!! ' + this.sc() + ': ' + this.name + ' - изменения не приняты!');
        };
        Vacations.prototype.getListUrl = function () {
            return '/admin/vacations';
        };
        Vacations.prototype.getEditUrl = function (id) {
            return '/admin/vacations/edit/' + id;
        };
        Vacations.prototype.getShowUrl = function (id) {
            return '/admin/vacation/' + id;
        };
        Vacations.prototype.deactivation = function () {
            return ' - деактивирована';
        };
        Vacations.prototype.addPosition = function (item) {
            if (angular.isArray(item.vacations)) {
                item.vacations.push({});
            } else {
                item.vacations = [{}];
            }
            return item;
        };
        Vacations.prototype.arr = [];
        Vacations.prototype.removePosition = function (vacation, item) {
            if (angular.isDefined(vacation) &&
                angular.isDefined(vacation.id)) {
                this.arr.push(vacation.id);
            }
            var vacations = item.vacations;
            for (var i = 0, ii = vacations.length; i < ii; i++) {
                if (vacation === vacations[i]) {
                    vacations.splice(i, 1);
                }
            }
            return item.removeVacation = this.arr;
        };
        return Vacations;
    })
;

