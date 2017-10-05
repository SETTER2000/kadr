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
            //.state('home.admin.vacations.settings', {
            //    url: '/settings',
            //    templateUrl: '/js/private/admin/vacations/views/home.admin.vacations.settings.html',
            //    controller: 'ListVacationController'
            //})
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
        //Vacations.prototype.getHoliday = function () {
        //    return this.getHoliday('58a461e66723246b6c2bc61b');
        //};
        Vacations.prototype.scs = function () {
            return this.sections;
        };

        Vacations.prototype.ok = function () {
            return alert(this.sc() + ': ' + this.name + ' изменёна!');
        };

        Vacations.prototype.getOwner = function () {
            return this.owner;
        };


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
    .filter("getICO", function () {
        return function (value) {
            //Одобрено 	    (APPROVE)   approved
            //Отказано 	    (REJECT)    denied
            //Подтверждено 	(CONFIRM)   confirmed
            //Перенесён 	(TRANSFER)  moved
            //Ожидание 	    (wait_one)  pending
            let o = {
                approved: 'glyphicon glyphicon-thumbs-up',
                denied: 'glyphicon glyphicon-thumbs-down',
                confirmed: 'glyphicon glyphicon-ok',
                pending: 'glyphicon glyphicon-hourglass',
                moved: 'glyphicon glyphicon-share-alt'
            };

            return o[value];

        }
    })
    .filter("changeName", function () {
        return function (value) {
            //Одобрено 	    (APPROVE)   approved
            //Отказано 	    (REJECT)    denied
            //Подтверждено 	(CONFIRM)   confirmed
            //Перенесён 	(TRANSFER)  moved
            //Ожидание 	    (wait_one)  pending
            let o = {
                approved: 'Одобрено',
                denied: 'Отказано',
                confirmed: 'Подтверждено',
                moved: 'Перенесён',
                pending: 'Ожидание'
            };
            return o[value];
        }
    })
    .filter("checkPeriodBetween", function () {
        return function (value) {

            moment('2010-10-20').isBetween('2009-12-31', '2012-01-01', 'year'); // true

        }
    })
    .filter("interfaceYear", function () {
        /**
         * Фильтр отбирает объекты согласно сохранённому году интерфейса пользователя
         * т.е. с какого года начинать выводить отпуска
         */
        return function (value, me) {
            if (!angular.isArray(value)) return value;
            let arr = [];
            value.forEach(function (v, k, a) {
                let startOff = moment(me.year, ['YYYY']).startOf('year');
                let endOff = moment(me.year, ['YYYY']).endOf('year');

                /**
                 * !!! НЕ УДАЛЯТЬ ЗАПРОС
                 *  То же или после  &&  То же или до
                 *  В общем случаи между )
                 */
                //if (moment(v['from']).isSameOrAfter(startOff, 'year') && moment(v['to']).isSameOrBefore(endOff, 'year')) {
                //    arr.push(v);
                //}

                /**
                 * То же или после
                 */
                if (moment(v['from']).isSameOrAfter(startOff, 'year')) {
                    arr.push(v);
                }
            });
            return arr;
        }
    })
;

