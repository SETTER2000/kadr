(function (angular) {
    'use strict';
    angular.module('CalendarModule')
        .controller('ListCalendarController', ['$scope', 'Calendars', '$state',
            function ($scope, Calendars, $state) {


                // var ups = $scope.ups =  Calendars.query();
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
                    $scope.items = Calendars.query({limit:300, sort: 'name DESC'},function (calendars) {
                        $scope.calendars = calendars;
                         //console.log('SUCCCE: ');
                         //console.log( $scope.calendars);
                        // console.log( $scope.calendars.filter({"action": 1}));
                        // console.log(calendars.get({"action": 1},function (success) {
                        //     console.log('URAAA:');
                        //     alert('5685');
                        //     console.log(success);
                        // },function (err) {
                        //     alert('ERRRRRR');
                        //     console.log(err);
                        // }));
                        // кол-во пользователей
                        // console.log($scope.calendars.length);
                        //console.log(calendars.scs());
                    });
                };

                //$scope.sections =   $scope.calendars.sections();
                $scope.propertyName = 'name';
                $scope.reverse = false;
                // $scope.friends = friends;


                $scope.sortBy = function (propertyName) {
                    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
                    $scope.propertyName = propertyName;
                };


                // конструктор хлебных крошек
                function BreadCrumb() {
                    let name;
                    let path;
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

                const breadcrumb = new BreadCrumb();
                breadcrumb.set('Home', '/');
                breadcrumb.set('Admin', '/admin');
                breadcrumb.set('Calendars', '/calendars/' + $state.current.url);
                $scope.breadcrumbs = breadcrumb;


                $scope.refresh();

            }])
    ;
})(window.angular);