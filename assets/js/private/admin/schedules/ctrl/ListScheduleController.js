(function (angular) {
    'use strict';
    angular.module('ScheduleModule')
        .controller('ListScheduleController', ['$scope', '$location', 'moment', '$http', 'toastr', "$rootScope", '$timeout', '$state', 'Schedules', 'Users', '$window', function ($scope, $location, moment, $http, toastr, $rootScope, $timeout, $state, Schedules, Users) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.kadr && !$scope.me.admin) $state.go('home');


            $scope.$on('defaultRowsTable', function (event,data) {
                console.log('defaultRowsTable',data); // Данные, которые нам прислали
                return  $scope.defaultRows =  data.defaultRows;
            });




            $scope.defaultRows = ($scope.me.defaultRows)?$scope.me.defaultRows :15;
            //$scope.defaultRows =6;
            $scope.limitRows = [2, 3, 5, 7,10, 15, 30, 50, 70, 100];
            $scope.currentPage = 1; // инициализируем кнопку постраничной навигации
            //console.log('defaultRows:::', $scope.defaultRows);
            //$scope.$watch('defaultRows', function (value,old) {
            //    $http.put('/schedule/update-rows',{
            //            defaultRows: $scope.defaultRows
            //        })
            //        .then(function onSuccess(sailsResponse) {
            //            console.log('sailsResponse in ListController: ',sailsResponse.data[0].defaultRows);
            //             $scope.defaultRows = $scope.me.defaultRows=sailsResponse.data[0].defaultRows;
            //        })
            //        .catch(function onError(sailsResponse) {
            //             toastr.error('ERRDDD!');
            //        })
            //        .finally(function eitherWay() {
            //            $scope.editProfile.loading = false;
            //        });
            //});



            $scope.nameHeader = {
                oneArea: 'Наименование',
                twoArea: 'Год',
                threeArea: 'Статус',
                fourArea: 'C',
                fiveArea: 'До',
                sixArea: 'Кол-во дней',
                sevenArea: 'Создал',
                eightArea: 'Обновил',
                nineArea: 'Кол-во собраных данных',
                tenArea: 'Обновил',
                createdAtArea: 'Создано',
                updatedAtArea: 'Обновлено'
            };


            $scope.added = 'Добавить график';
            $scope.showBt = 1;
            // показать формочку выбора кол-ва строк на странице
            $scope.showContIt = ($scope.me.admin) ? 1 : 0;
            $scope.showStr = 0;
            $scope.urlBt = 'home.admin.schedules.create';

            $scope.sort = 'createdAt ASC';// сортировка по умолчанию
            $scope.param = 'lastName';
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


            if (moment().isLeapYear()) {
                $scope.yearLeap = 'Да!';
            } else {
                $scope.yearLeap = 'Нет';
            }

            $scope.yearLeap = moment(1316116057189).fromNow();

            $scope.message = {
                text: 'hello world!',
                time: new Date()
            };



            /**
             * Фильтры для каждой выбираемой страницы
             *
             */
            $scope.filterTemplate = {
                all: {}, // все
                project:  {status: 'Проект'}, // проект
                inWork:   {status: 'В работе'}, // в работе
                approved: {status: 'Утвержден'} // утверждён
            };

            $scope.$watch('modeSelect.value', function (value, old) {
                //console.log('modeSelect OLD', old);
                //console.log('modeSelect NEW', value);
                $scope.ftObj = $scope.filterTemplate[value];
            });
            $scope.$watch('searchText', function (value, old) {
                //console.log('OLD', old);
                //console.log('NEW', value);
                $scope.searchText = value;
                // $scope.refresh();
            });
            $scope.options =
                [
                    {display: "Все", value: "all"},
                    {display: "Проект", value:    "project"},
                    {display: "В работе", value:  "inWork"},
                    {display: "Утвержден", value: "approved"}

                ];
            $scope.modeSelect = $scope.options[0];
            //$scope.tableView = "/js/private/admin/schedules/views/home.admin.schedules.table.html";
            //$scope.listView = "/js/private/admin/schedules/views/home.admin.schedules.list.html";
            //$scope.actionView = "/js/private/admin/schedules/views/home.admin.schedules.action.html";
            //$scope.workView = "/js/private/admin/schedules/views/home.admin.schedules.work.html";
            $scope.getLastName = function (item) {
                $http.post('/att', item)
                    .then(function (attendance) {
                        $scope.differ(attendance);
                        $scope.numPages = Math.floor($scope.items.length / $scope.defaultRows) + 1;
                    });
            };


            $scope.loadOptions = function () {
                return $timeout(function () {
                    $scope.options = $scope.options || [
                            {display: "Работают", value: "work"},
                            {display: "Уволены", value: "list"},
                            {display: "Не активированы / Заблокированы", value: "action"},
                            {display: "Все", value: "table"}
                        ];
                }, 1);
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

            $scope.str = 'Петров';
            $scope.countChar = '4';
            $scope.filedName = 'lastName';


            $scope.$watch('where', function (value) {

                $scope.refresh(value);

            });

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
                    property: 'name',
                    char: $scope.charText + '%'
                };

                $scope.items = Schedules.query($scope.query, function (schedules) {
                    console.log('SCHEDULE ITEMS:', schedules);
                    $scope.items =  schedules;

                    $scope.countCurrentView = schedules.length;
                    $scope.objectName = schedules;
                    //$scope.numPages = Math.floor(schedules.length / $scope.defaultRows) + 1;
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

            $scope.propertyName = 'lastName';

            $scope.reverse = false;

            $scope.sortBy = function (propertyName) {
                $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
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
            breadcrumb.set('Schedules', '/admin/' + $state.current.url);
            $scope.breadcrumbs = breadcrumb;

            $scope.refresh();
        }]);
})(window.angular);