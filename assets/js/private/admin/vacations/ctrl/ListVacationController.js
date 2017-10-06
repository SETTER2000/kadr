(function (angular) {
    'use strict';
    angular.module('VacationModule')
        .controller('ListVacationController', ['$scope', '$location', 'moment', '$http', 'toastr', "$rootScope", '$timeout', '$state', 'Vacations', 'Users', '$window', function ($scope, $location, moment, $http, toastr, $rootScope, $timeout, $state, Vacations, Users) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.kadr && !$scope.me.admin) $state.go('home');

            //$scope.trackexpr = $scope.me.interface;
            //$scope.$watch('trackexpr', function (value) {
            //    $scope.interface(value);
            //    $scope.refresh();
            //});
            //toastr.options = {
            //    "closeButton": false,
            //    "debug": false,
            //    "newestOnTop": false,
            //    "progressBar": false,
            //    "positionClass": "toast-top-full-width",
            //    "preventDuplicates": true,
            //    "onclick": null,
            //    "showDuration": "300",
            //    "hideDuration": "1000",
            //    "timeOut": "5000",
            //    "extendedTimeOut": "1000",
            //    "showEasing": "swing",
            //    "hideEasing": "linear",
            //    "showMethod": "fadeIn",
            //    "hideMethod": "fadeOut"
            //};


            /**
             * PAGINATION
             */
            $scope.defaultRows = 20;
            $scope.limitRows = [30, 50, 70, 100];
            $scope.currentPage = 1; // инициализируем кнопку постраничной навигации

            $scope.fioArea = 'Период с .. по ..';
            $scope.loginArea = 'Логин';
            $scope.tipArea = 'Тип';
            $scope.statusArea = 'Статус';
            $scope.lastNameArea = 'Владелец';
            $scope.createdAt = 'Создан';
            $scope.updatedAt = 'Изменён';
            $scope.whomUpdatedArea = 'Кем изменён';
            $scope.whomCreatedArea = 'Кем создан';
            $scope.actionsArea = 'Действие';
            $scope.infoArea = 'Информация';
            $scope.daysSelectHolidayArea = 'Дней';
            $scope.added = 'Добавить отпуск';
            $scope.showBt = 1;
            $scope.countHolidayRF = 28;
            // показать формочку выбора кол-ва строк на странице
            $scope.showContIt = ($scope.me.admin) ? 1 : 0;
            $scope.showStr = 1;
            $scope.urlBt = 'home.admin.vacations.create';

            $scope.sort = 'updatedAt DESC';
            $scope.param = 'lastName';
            $scope.propertyName = 'updatedAt';
            //$scope.propertyName = 'owner.lastName';
            $scope.fieldName = 'Внутренний телефон';
            $scope.charText = '';
            $scope.searchText = '';
            $scope.page_number = 0;
            $scope.limitAll = 1000;
            $scope.where = {};
            $scope.alfavit = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];
            $scope.enabledButton = false;
            $scope.styleObj = {
                color: false,
                border: false,
                size: false
            };

            //$scope.days = moment.duration(2).days();
            //$scope.hours = moment.duration(2).hours();
            //$scope.month = moment.duration().months();
            //$scope.months = moment.duration().asMonths();
            //$scope.seconds = moment.duration(1000).seconds();
            //var a = moment('2016-01-21 09:38:00', ['DD.MM.YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']);
            //var b = moment('2016-01-21 13:54:00', ['DD.MM.YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']);
            //$scope.diff = b.diff(a, 'm');
            //$scope.exampleDate = moment().hour(8).minute(0).second(0).toDate();
            //$scope.local = moment().local().format("ddd, hA");
            //$scope.local = moment().local().format("dddd, MMMM Do YYYY, h:mm:ss a");
            //$scope.localTime = moment().local().format();
            //$scope.localTime = moment.parseZone('2016-05-03T22:15:01+02:00').local().format();
            //$scope.localTime = moment().utc().local().hours();
            //var start = moment([2007, 0, 5]);
            //var end = moment([2007, 0, 10]);
            //end.from(start);       // "in 5 days"
            //$scope.end = end.from(start, true); // "5 days"

            if (moment().isLeapYear()) {
                $scope.yearLeap = 'Да!';
            } else {
                $scope.yearLeap = 'Нет';
            }

            $scope.yearLeap = moment(1316116057189).fromNow();


            /**
             * Год
             * @type {*[]}
             */
            $scope.options2 =
                [
                    {id: "2015", year: "2015"},
                    {id: "2016", year: "2016"},
                    {id: "2017", year: "2017"},
                    {id: "2018", year: "2018"},
                    {id: "2019", year: "2019"}
                ];
            $scope.modeSelectYear = $scope.options2[0];


            $scope.inter = {year:moment().year()};
            $scope.$watch('interface', function (value, old) {
                console.log('HHO', value);
                if(value) {
                    $http.put('/interface/update', {
                            year: value
                        })
                        .then(function onSuccess(sailsResponse) {
                            console.log('sailsResponse: ', sailsResponse);
                            $scope.inter = sailsResponse.data[0];
                        })
                        .catch(function onError(sailsResponse) {
                            if (sailsResponse.data.status >= 400 < 404) {
                                $scope.restoreProfileForm.errorMsg = 'An unexpected error occurred: ' + (sailsResponse.data || sailsResponse.status);
                                toastr.error('The email/password combination did not match a user profile.', '', {timeOut: 1000});
                                return;
                            }
                        })
                        .finally(function eitherWay() {

                        });
                }
            });
            /**
             * Кол-во дн. отпуска выбранных в конкретном году
             */
            $scope.getDays = function () {
                $http.get('/vacation/getDays/?year=' + moment().year()).then(function success(response) {
                        $scope.days = $scope.countHolidayRF - response.data.count;
                    },
                    function errorCallback(response) {

                    }
                );
            };

            /**
             *  год
             */
            $scope.getInterface = function () {
                $http.get('/interface/get').then(function success(response) {
                    $scope.interface = {name:response.data.year, id:response.data.year};
                        console.log('INTERFACES+: ',$scope.interface);
                    $scope.me.intarface['name'] = response.data.year;
                    $scope.me.intarface['id'] = response.data.year;
                    },
                    function errorCallback(response) {

                    }
                );
            };
            $scope.getInterface();
            $scope.getDays();

            $scope.options =
                [
                    {display: "Активированы", value: "work"},
                    //{display: "Уволены", value: "list"},
                    {display: "Не активированы / Заблокированы", value: "action"},
                    {display: "Все", value: "table"}
                ];
            $scope.modeSelect = $scope.options[0];
            $scope.tableView = "/js/private/admin/vacations/views/home.admin.vacations.table.html";
            //$scope.listView = "/js/private/admin/vacations/views/home.admin.vacations.list.html";
            $scope.actionView = "/js/private/admin/vacations/views/home.admin.vacations.action.html";
            $scope.workView = "/js/private/admin/vacations/views/home.admin.vacations.work.html";

            //$scope.option = null;
            //$scope.options = null;
            $scope.loadOptions = function () {
                // Use timeout to simulate a 650ms request.
                return $timeout(function () {

                    $scope.options = $scope.options || [
                            {display: "Активированы", value: "work"},
                            //{display: "Уволены", value: "list"},
                            {display: "Не активированы / Заблокированы", value: "action"},
                            {display: "Все", value: "table"}
                        ];

                }, 650);

            };


            $scope.getLastName = function (item) {
                $http.post('/att', item)
                    .then(function (attendance) {
                        $scope.differ(attendance);
                        $scope.numPages = Math.floor($scope.items.length / $scope.defaultRows) + 1;
                    });
            };

            $scope.differ = function (attendance) {
                var data = [];
                for (var i = 0; i < attendance.data.length; i++) {
                    (function () { // каждая созданная функция будет работать со своей локальной переменной.
                        var local = i;
                        var a, b;
                        a = moment(attendance.data[local].time_in, ['HH:mm:ss']);
                        b = moment(attendance.data[local].time_out, ['HH:mm:ss']);

                        data.push({
                            'getFullName': function () {
                                return this.lname + ' ' + this.fname + ' ' + this.pname;
                            },
                            getContact: function (fieldName) {
                                return this.date;
                            },
                            'pname': attendance.data[local].pname,
                            'lname': attendance.data[local].lname,
                            'fname': attendance.data[local].fname,
                            'date': attendance.data[local].date,
                            'birthday': attendance.data[local].time_in,
                            'login': attendance.data[local].time_out,
                            'email': attendance.data[local].email,
                            'diff': $scope.getTimeFormatMilliseconds(b.diff(a), 1, 'Неизвестно')
                        });
                    })();
                }
                $scope.items = data;
            };

            /**
             * Проверка на точное соответствие аргумента n числу
             * @param n
             * @returns {boolean}
             */
            $scope.isNumeric = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            };

            $scope.getTimeFormatMilliseconds = function (milliseconds, secondAdd, mess) {
                if ($scope.isNumeric(milliseconds)) {
                    var a = {};
                    var sec;
                    sec = (secondAdd) ? ':00' : '';
                    // всего минут
                    a.min = (milliseconds / 1000) / 60;
                    // минуты после целого, т.е. часов
                    a.minCeil = (a.min % 60);
                    // Добавляем ведущий ноль
                    a.minCeil = (a.minCeil < 10) ? ('0' + a.minCeil) : a.minCeil;
                    a.hoursCeil = Math.floor(a.min / 60); // минуты после целого, т.е. часов
                    // Добавляем ведущий ноль (один час был: 1 стал 01)
                    a.hoursCeil = (a.hoursCeil < 10) ? ('0' + a.hoursCeil) : a.hoursCeil;
                    milliseconds = a.time = a.hoursCeil + ':' + a.minCeil + sec;
                } else {
                    // Сообщение если отсутствует значение или оно не корректно
                    milliseconds = mess;
                }
                return milliseconds;
            };

            //$scope.str = 'Петров';
            $scope.countChar = '4';
            $scope.filedName = 'lastName';


            $scope.$watch('where', function (value) {

                $scope.refresh(value);

            });
            $scope.objectName = [];

            $scope.refresh = function (where) {
                if (where) {
                    $scope.where = where;
                } else {
                    $scope.where = {};
                }
                $scope.query = {
                    where: $scope.where,
                    sort: $scope.sort,
                    limit: $scope.limitAll,
                    property: 'lastName',
                    char: $scope.charText + '%'
                };
                console.log(' MY QUERY:', $scope.query);
                $scope.items = Vacations.query($scope.query, function (vacations) {
                    console.log('Vacations ITEMS22:', vacations);
                    $scope.objectName = [];
                    //$scope.me.interface = vacations.interfaces[0].year;
                    for (var u = 0; u < vacations.length; u++) {
                        $scope.objectName.push(vacations[u].getOwner());
                    }
                    console.log('$scope.objectName', $scope.objectName);
                    $scope.numPages = Math.floor(vacations.length / $scope.defaultRows) + 1;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка77! ' + err.data.message);
                });
            };


            $scope.getMode = function (t) {
                if (t) {
                    $scope.refresh({"fired": false});
                    $scope.t = false;
                } else {
                    $scope.refresh({"fired": true});
                    $scope.t = true;
                }
            };

            $scope.getPage = function (num) {
                $scope.page_number = num;
            };

            $scope.delete = function (item) {
                item.$delete(item, function (success) {
                    $scope.refresh();
                }, function (err) {
                    console.log(err);
                })
            };

//$scope.$watch('countCurrentView', function (value) {
//   return $scope.countCurrentView = value;
//});

            $scope.reverse = true;

            $scope.sortBy = function (propertyName) {
                $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : true;
                $scope.propertyName = propertyName;
            };

            $scope.msd = ['settings', 'home', 'options', 'other'];

            $scope.selectionMode = $scope.msd[0];

            /**
             *  Конструктор хлебных крошек
             * @constructor
             */
            function BreadCrumb() {
                var name;
                var path;
                this.arr = [];
            }

            BreadCrumb.prototype.add = function () {
                this.arr.push({name: this.name, path: this.path});
            };

            BreadCrumb.prototype.set = function (name, path) {
                this.name = name;
                this.path = path;
                this.add();
            };

            BreadCrumb.prototype.getAll = function () {
                return this.arr;
            };

            var breadcrumb = new BreadCrumb();

            breadcrumb.set('Home', '/');
            breadcrumb.set('Admin', '/admin');
            breadcrumb.set('Vacations', '/admin/' + $state.current.url);
            $scope.breadcrumbs = breadcrumb;

            $scope.refresh();
        }]);
})(window.angular);