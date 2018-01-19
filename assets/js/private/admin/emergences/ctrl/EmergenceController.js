angular.module('EmergenceModule')
    .controller('EmergenceController', ['$scope', '$state','toastr', 'moment', 'Emergences', '$stateParams',
        function ($scope,$state,toastr, moment, Emergences, $stateParams) {
            //$scope.message = moment({start:'1995-12-25',end:'2000-10-10'}).year(2009).hours(0).minutes(0).seconds(0);
            /**
             * Метод query выполняет запрос на сервер и возвращает коллекцию,
             * которая содержит объекты с данными и дополнительными методами
             * которые используются для взаимодействия с данными на сервере $delete, $get, $remove, $save
             *
             * Так же можно определять свои методы для конструктора в фабрике модуля.
             * В данном конструкторе добавлен метод Emergences.getFullName()
             */

            $scope.refresh = function () {
                $scope.item = Emergences.get({id: $stateParams.emergenceId}, function (emergences) {
                    console.log('emergences', emergences);
                    $scope.emergences = emergences;
                }, function (err) {
                    toastr.error(err.data.details, 'Ошибка - 889! ' + err.data.message);
                });
            };

            $scope.refresh();
        }]);
