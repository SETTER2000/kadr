angular.module('UserModule')
    .controller('UserController', ['$scope', '$state','toastr', 'moment', 'Users', '$stateParams',
        function ($scope,$state,toastr, moment, Users, $stateParams) {
            //$scope.message = moment({start:'1995-12-25',end:'2000-10-10'}).year(2009).hours(0).minutes(0).seconds(0);
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод Users.getFullName()
             */

            $scope.refresh = function () {
                $scope.item = Users.get({id: $stateParams.userId}, function (users) {
                    $scope.users = users;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 889! ' + err.data.message);
                });
            };

            $scope.refresh();
        }]);
