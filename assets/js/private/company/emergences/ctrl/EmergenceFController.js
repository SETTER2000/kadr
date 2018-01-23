angular.module('EmergenceFModule')
    .controller('EmergenceFController', ['$scope', '$state','toastr', 'moment', 'EmergencesF', '$stateParams',
        function ($scope,$state,toastr, moment, EmergencesF, $stateParams) {
            $scope.me = window.SAILS_LOCALS.me;
            if (!$scope.me || !$scope.me.emergence) return $state.go('home');

            //$scope.message = moment({start:'1995-12-25',end:'2000-10-10'}).year(2009).hours(0).minutes(0).seconds(0);
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод EmergencesF.getFullName()
             */

            $scope.refresh = function () {
                $scope.item = EmergencesF.get({id: $stateParams.emergenceId}, function (emergences) {
                    console.log('emergences+user', emergences);
                    $scope.emergences = emergences;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 8832! ' + err.data.message);
                });
            };

            $scope.refresh();
        }]);
