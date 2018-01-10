angular.module('UserModule')
    .controller('ExitUserController', ['$scope','$state', 'moment', 'Users', '$stateParams',
        function ($scope, $state, moment, Users, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me.leader && !$scope.me.admin) $state.go('home');
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
                    if (err) console.log(err.message);
                });
            };

            $scope.refresh();
        }]);
