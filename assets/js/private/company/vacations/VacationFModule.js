angular.module('VacationFModule', ['ui.router', 'toastr', 'ngResource', 'ngAnimate', 'angularMoment','ngMaterial'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.company.vacations', {
                url: '/vacations',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/vacations/tpl/list.tpl.html',
                        controller: 'ListVacationFController'
                    },
                    'sidebar-right@home.company.vacations': {
                        templateUrl: '/js/private/company/vacations/views/sidebar-right.view.html'
                    }
                }
            })
            .state('home.company.vacations.edit', {
                url: '/edit/:vacationId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/vacations/tpl/edit.tpl.html',
                        controller: 'EditVacationFController'
                    }
                }
            })
            //.state('home.company.vacations.settings', {
            //    url: '/settings',
            //    templateUrl: '/js/private/company/vacations/views/home.company.vacations.settings.html',
            //    controller: 'ListVacationFController'
            //})
            .state('home.company.vacation', {
                url: '/vacation/:vacationId',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/departments/tpl/show.tpl.html',
                        controller: 'VacationFController'
                    }
                }
            })
            .state('home.company.vacations.create', {
                url: '/create',
                views: {
                    '@': {
                        templateUrl: '/js/private/company/vacations/tpl/edit.tpl.html',
                        controller: 'EditVacationFController'
                    }
                }
            })


            //.state('home.company.vacation.report',{
            //    views: {
            //        'filters': {
            //            templateUrl: 'report-filters.html',
            //            controller: 'ListVacationFController'
            //        },
            //        'tabledata': {
            //            templateUrl: 'report-table.html',
            //            controller: 'ListVacationFController'
            //        },
            //        'graph': {
            //            templateUrl: 'report-graph.html',
            //            controller: 'ListVacationFController'
            //        }
            //    }
            //})

        ;
    })
    .constant('CONF_MODULE_VACATION', {baseUrl: '/vacations/:vacationId'})
    .factory('VacationsF', function ($resource, $http, CONF_MODULE_VACATION) {
        var VacationsF = $resource(
            CONF_MODULE_VACATION.baseUrl,
            {vacationId: '@id'},
            // Определяем собственный метод update на обоих уровнях, класса и экземпляра
            {
                update: {
                    method: 'PUT'
                }
            }
        );


        VacationsF.prototype.formatDate = function (date) {

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

        VacationsF.prototype.getFullName = function () {
            return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
        };

        VacationsF.prototype.sc = function () {
            return this.section;
        };
        //VacationsF.prototype.getHoliday = function () {
        //    return this.getHoliday('58a461e66723246b6c2bc61b');
        //};
        VacationsF.prototype.scs = function () {
            return this.sections;
        };

        VacationsF.prototype.ok = function () {
            return alert(this.sc() + ': ' + this.name + ' изменёна!');
        };

        VacationsF.prototype.getOwner = function () {
            return this.owner;
        };


        VacationsF.prototype.er = function () {
            return alert('ОШИБКА!!! ' + this.sc() + ': ' + this.name + ' - изменения не приняты!');
        };
        VacationsF.prototype.getListUrl = function () {
            return '/company/vacations';
        };
        VacationsF.prototype.getEditUrl = function (id) {
            return '/company/vacations/edit/' + id;
        };
        VacationsF.prototype.getShowUrl = function (id) {
            return '/company/vacation/' + id;
        };
        VacationsF.prototype.deactivation = function () {
            return ' - деактивирована';
        };
        VacationsF.prototype.addPosition = function (item) {
            if (angular.isArray(item.vacations)) {
                item.vacations.push({});
            } else {
                item.vacations = [{}];
            }
            return item;
        };
        VacationsF.prototype.arr = [];
        VacationsF.prototype.removePosition = function (vacation, item) {
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
        VacationsF.prototype.getIntersec = function () {
            //console.log('this.intersec', this.intersec);
            return (this.intersec.length > 0) ? this.intersec : false;
        };
        return VacationsF;
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
        return function (value, obj) {
            if (!angular.isArray(value)) return value;
            let arr = [];
            value.forEach(function (v, k, a) {
                //console.log('YEARSSSS: ', me);
                let startOff = moment(obj.year, ['YYYY']).startOf('year');
                let endOff = moment(obj.year, ['YYYY']).endOf('year');

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
    .filter("searchObjectVal", function () {
        /**
         * Фильтр отбирает объекты после проверки на соответствие
         * определенного поля коллекции и нахождения в нем соответствующих
         * значений из входящего массива
         * Например: в поле furlough, должен находиться объект со свойством name, которое
         * содержит значение 'Отпуск по беременности и родам' или 'Отпуск по уходу за ребенком'
         */
        return function (value, nameProperty, nameColllectionProperty, valueArr) {
            if (!angular.isArray(value) || !angular.isArray(valueArr)) return value;
            let arr = [];
            value.forEach(function (v, k, a) {
                if (valueArr.indexOf(v[nameProperty][nameColllectionProperty]) !== -1) {
                    arr.push(v);
                }
            });
            return arr;
        }
    })
    .filter("changeFoto", function () {
        return function (value, size='150x150') {
            if (!angular.isArray(value) || !angular.isString(size)) return value;
            let arr = [];
            value.forEach(function (v, k, a) {

                if (!v.avatarUrl) {
                    v.avatarUrl = 'http://via.placeholder.com/'+size;
                }
                arr.push(v);
                //if (valueArr.indexOf(v[nameProperty][nameColllectionProperty]) !== -1) {
                //    arr.push(v);
                //}
            });
            return arr;
        }
    })
;

