(function (angular) {
    'use strict';
    angular.module('StructureModule')
        .controller('ListStructureController', ['$scope', '$location', 'moment', '$http', 'toastr', "$rootScope", '$state', 'Structures', '$window',
            function ($scope, $location, moment, $http, toastr, vAccordion, $state, Structures) {
                $scope.me = window.SAILS_LOCALS.me;
                if (!$scope.me.kadr && !$scope.me.admin) $state.go('home');

                $scope.query = {
                    // where: {}
                    // sortField: $scope.sortField,
                    // sortTrend: $scope.sortTrend,
                    // limit: $scope.limitAll,
                    // page: 0,
                    // sd: $scope.start,
                    // regex:'',
                    // property: 'name'
                };
   


                $scope.changed = function () {
                    let quest = '';
                    quest = angular.element(document.querySelector(".quest")).text();
                    if (!quest) return;
                    $http.get('/user/getUsersDepartment/' + quest)
                        .then(function (response) {
                            console.log('response: ', response);
                            $scope.users = response.data;
                        });
                    console.log('ups22:', quest);
                };


                /**
                 * VALUES
                 */
                $scope.defaultRows = 50;
                $scope.limitRows = [50, 100, 300, 500, 700, 1000];
                $scope.currentPage = 1; // инициализируем кнопку постраничной навигации
                $scope.allRowsView = 'загружено:';
                $scope.fioArea = 'ФИО';
                $scope.loginArea = 'Логин';
                $scope.dateArea = 'Дата';
                $scope.startPeriodArea = 'Приход';
                $scope.endPeriodArea = 'Уход';
                $scope.factArea = 'Отработанное время';
                $scope.added = 'Добавить сотрудника';
                $scope.showBt = false; // показать кнопку добавления объекта
                $scope.sortField = 'name'; // поле сортировки
                $scope.sortTrend = 1; // направление сортировки
                $scope.param = 'date';
                $scope.fieldName = 'Внутренний телефон';
                $scope.charText = '';
                $scope.searchText = '';
                $scope.page_number = 0;
                $scope.limitAll = '';
                $scope.where = '^.';
                $scope.sd = '';
                $scope.enabledButton = false;
                $scope.styleObj = {
                    color: false,
                    border: false,
                    size: false
                };
                $scope.vis = false;
                $scope.data = [];
                $scope.data['selectedOption'] = {};
                $scope.propertyName = 'lastName';
                $scope.propertyName2 = 'date';
                $scope.reverse = false;
                $scope.countChar = 3;  // Кол-во знаков от фамилии
                $scope.filedName = '_id';


                $scope.sortRevers = function (field) {
                    $scope.sortTrend = (+$scope.sortTrend > 0) ? -1 : 1;
                    $scope.sortField = field;
                };


                $scope.options =
                    [
                        {display: "Древовидная структура", value: "structure"}
                    ];


                $scope.modeSelect = $scope.options[0];
                $scope.structureView = "/js/private/admin/structures/views/home.admin.structures.html";
                //$scope.workView = "/js/private/admin/skds/views/home.admin.skds.work.html";
                // $scope.testView = "/js/private/admin/skds/views/test.html";
                // $scope.tableView = "/js/private/admin/skds/views/home.admin.skds.table.html";
                // $scope.listView = "/js/private/admin/skds/views/home.admin.skds.list.html";
                // $scope.actionView = "/js/private/admin/skds/views/home.admin.skds.action.html";


                $scope.$watch('where', function (value, old) {
                    // console.log('New val: ',value);
                    // console.log('Old val: ',old);
                    $scope.query.regex = value;
                    $scope.refresh();
                });


                $scope.toggleBlur = function (mx) {
                    $scope.query.sd = mx;
                    $scope.mx = mx;
                    $scope.refresh();
                };


                $scope.getPage = function (num) {
                    $scope.page_number = num;
                };


                $scope.sortBy = function (propertyName) {
                    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
                    $scope.propertyName = propertyName;
                };


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
                breadcrumb.set('Structures', '/admin/' + $state.current.url);
                $scope.breadcrumbs = breadcrumb;


                $scope.refresh = function () {
                    Structures.query($scope.query, function (structures) {
                        console.log('STRUCTURES:', structures);
                            $scope.items = structures;
                        }, function (err) {
                            toastr.error(err.data.details, 'Ошибка 7700! ' + err.data.message);
                        });
                };
                $scope.refresh();
            }]);
})(window.angular);