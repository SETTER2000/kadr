(function (angular) {
    'use strict';
    angular.module('PositionModule')
        .controller('ListPositionController', ['$scope', 'Positions','toastr', '$state',function ($scope, Positions,toastr, $state) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.admin && !$scope.me.kadr) return $state.go('home');
                /**
                 * Поле сортировки объекта по умолчанию.
                 * @type {string}
                 */
                $scope.sort = 'name';

                /**
                 * Кол-во строу, по умолчанию, выбраных в объект
                 */
                $scope.limit = 300;

                $scope.refresh = function () {
                    /**
                     * При обращении к службе $resource возвращается сгенерированный конструктор,
                     * дополненный методами для взаимодействия с конечной точкой
                     * RESTful: query, get, save и delete.
                     */
                    // Сортировка наоборот sort: 'name DESC'
                    $scope.items = Positions.query({limit:$scope.limit, sort: $scope.sort},function (positions) {
                        //console.log('POSITIONS ITEMS:', positions);
                        $scope.items = positions;
                    }, function(err){
                        toastr.error(err,'Ошибка ListPositionController!');
                    });
                };


                $scope.propertyName = 'name';
                $scope.reverse = false;

                $scope.sortBy = function (propertyName) {
                    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
                    $scope.propertyName = propertyName;
                };


                $scope.msd = ['settings', 'home', 'options', 'other'];
                $scope.selectionMode = $scope.msd[0];


                // конструктор хлебных крошек
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
                breadcrumb.set('Positions', '/positions/' + $state.current.url);
                $scope.breadcrumbs = breadcrumb;
                $scope.delete = function (item) {
                    console.log(item);
                    item.$delete(item, function (success) {
                        console.log(success);
                        $scope.refresh();
                    }, function (err) {
                        console.log(err);
                    })
                };
                $scope.refresh();
            }])
    ;
})(window.angular);