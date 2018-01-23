(function (angular) {
    'use strict';
    angular.module('DepartmentFModule')
        .controller('ListDepartmentFController', ['$scope', 'toastr', 'DepartmentsF', '$state',
            function ($scope, toastr, DepartmentsF, $state) {
                $scope.me = window.SAILS_LOCALS.me;
                if (!$scope.me) return $state.go('home');

                // var ups = $scope.ups =  DepartmentsF.query();
                //  console.log('UPS1: ');
                //  console.log(ups);
                //  // console.log( $scope.ups.then(onFullField));
                //  ups.$promise.then(onFullField,onReject);
                //
                //  function onFullField(succ){
                //      console.log('DADAD!!!: ');
                //      console.log(succ);
                //
                //      console.log('DADAD!!22!: ');
                //      console.log(succ.filter(action:1);
                //  }

                // function onReject(err) {
                //     console.log('ONreject');
                //     console.log(err);
                // }

                $scope.refresh = function () {
                    /**
                     * При обращении к службе $resource возвращается сгенерированный конструктор,
                     * дополненный методами для взаимодействия с конечной точкой
                     * RESTful: query, get, save и delete.
                     */
                    // Сортировка наоборот sort: 'name DESC'
                    $scope.items = DepartmentsF.query({limit: 300, sort: 'name'}, function(departments) {
                        //console.log('DEPARTMENTS:', departments);
                        $scope.items = departments;
                    }, function (err) {
                        toastr.error(err, 'Ошибка ListDepartmentFController!');
                    });
                };

                //$scope.sections =   $scope.departments.sections();
                $scope.propertyName = 'name';
                $scope.reverse = false;
                // $scope.friends = friends;


                $scope.sortBy = function (propertyName) {
                    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
                    $scope.propertyName = propertyName;
                };


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
                breadcrumb.set('Company', '/company');
                breadcrumb.set('DepartmentsF', '/departments/' + $state.current.url);
                $scope.breadcrumbs = breadcrumb;


                $scope.refresh();

            }])
    ;
})(window.angular);